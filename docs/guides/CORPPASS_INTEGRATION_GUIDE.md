# CorpPass Integration Guide

This guide covers the complete setup of CorpPass OIDC authentication with MockPass for development.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [MockPass Configuration](#mockpass-configuration)
6. [Session Management](#session-management)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

## Overview

**What is CorpPass?**
- Singapore's corporate digital identity for businesses
- Uses OpenID Connect (OIDC) for authentication
- Provides NRIC, UEN, and corporate information

**What we implemented:**
- Dual authentication: Email/password + CorpPass OIDC
- NRIC-based user matching (primary identifier)
- JWT client assertions (private_key_jwt method)
- Encrypted ID tokens (JWE with ECDH-ES+A256KW)
- MockPass for development testing
- Production-ready session management

## Prerequisites

### Required Packages

```bash
# Backend dependencies
npm install --save \
  passport-oauth2 \
  jwks-rsa \
  jose \
  cookie-parser

npm install --save-dev \
  @types/passport-oauth2 \
  @opengovsg/mockpass
```

### Required Knowledge

- NestJS/Express framework
- Passport.js authentication
- OAuth 2.0 / OIDC flow
- JWT (JSON Web Tokens)
- Prisma ORM

## Backend Setup

### Step 1: Database Schema

Add NRIC field and CorpPass user table to your Prisma schema:

```prisma
// prisma/schema.prisma

model User {
  id                  String              @id @default(uuid())
  email               String              @unique
  passwordHash        String              @map("password_hash")
  name                String
  nric                String?             @unique  // National Registration Identity Card
  role                UserRole
  status              UserStatus          @default(active)
  // ... other fields
  
  corpPassUser        CorpPassUser?       // One-to-one relationship
}

model CorpPassUser {
  id           String   @id @default(uuid())
  userId       String   @unique @map("user_id")
  corpPassSub  String   @unique @map("corppass_sub")  // CorpPass subject identifier
  uen          String?  // Unique Entity Number
  nric         String?  // National Registration ID
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("corppass_users")
}
```

Run migration:

```bash
npx prisma migrate dev --name add_corppass_integration
npx prisma generate
```

### Step 2: NRIC Validation Utility

Create NRIC validation following Singapore's algorithm:

```typescript
// src/common/utils/nric-validation.ts

/**
 * Validate Singapore NRIC/FIN according to official algorithm
 * Format: 1 letter + 7 digits + 1 checksum letter
 * First letter: S, T, F, G, M (S/T for citizens, F/G for foreigners, M for M series)
 */
export function validateNRIC(nric: string): boolean {
  if (!nric || typeof nric !== 'string') return false;
  
  const nricUpper = nric.toUpperCase().trim();
  
  // Check format: 1 letter + 7 digits + 1 letter
  if (!/^[STFGM]\d{7}[A-Z]$/.test(nricUpper)) return false;
  
  const firstLetter = nricUpper[0];
  const digits = nricUpper.substring(1, 8);
  const checksumLetter = nricUpper[8];
  
  // Weight array for checksum calculation
  const weights = [2, 7, 6, 5, 4, 3, 2];
  
  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  
  // Add offset for M series
  if (firstLetter === 'M') {
    sum += 4;
  }
  
  // Get checksum letter based on first letter and remainder
  const remainder = sum % 11;
  let expectedChecksum: string;
  
  if (firstLetter === 'S' || firstLetter === 'T') {
    const stChecksums = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    expectedChecksum = stChecksums[remainder];
  } else if (firstLetter === 'F' || firstLetter === 'G') {
    const fgChecksums = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    expectedChecksum = fgChecksums[remainder];
  } else if (firstLetter === 'M') {
    const mChecksums = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'];
    expectedChecksum = mChecksums[remainder];
  } else {
    return false;
  }
  
  return checksumLetter === expectedChecksum;
}

/**
 * Generate valid Singapore NRICs for testing
 */
export function generateValidNRIC(prefix: 'S' | 'T' | 'F' | 'G' | 'M', digits: string): string {
  if (digits.length !== 7 || !/^\d{7}$/.test(digits)) {
    throw new Error('Digits must be exactly 7 numeric characters');
  }
  
  const weights = [2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 7; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  
  if (prefix === 'M') {
    sum += 4;
  }
  
  const remainder = sum % 11;
  let checksum: string;
  
  if (prefix === 'S' || prefix === 'T') {
    const stChecksums = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    checksum = stChecksums[remainder];
  } else if (prefix === 'F' || prefix === 'G') {
    const fgChecksums = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    checksum = fgChecksums[remainder];
  } else {
    const mChecksums = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'];
    checksum = mChecksums[remainder];
  }
  
  return `${prefix}${digits}${checksum}`;
}
```

### Step 3: Generate Cryptographic Keys

CorpPass requires ES256 signing keys and ECDH-ES+A256KW encryption keys:

```bash
# Create directory for certificates
mkdir -p backend/static/certs

# Generate ES256 signing key pair (for JWT client assertions)
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  // Generate ES256 key pair for signing
  const { publicKey, privateKey } = await jose.generateKeyPair('ES256', { extractable: true });
  
  const privateJwk = await jose.exportJWK(privateKey);
  const publicJwk = await jose.exportJWK(publicKey);
  
  privateJwk.use = 'sig';
  privateJwk.alg = 'ES256';
  privateJwk.kid = 'checkup-app-sig-2024';
  
  publicJwk.use = 'sig';
  publicJwk.alg = 'ES256';
  publicJwk.kid = 'checkup-app-sig-2024';
  
  // Save private key (keep secret!)
  fs.writeFileSync(
    'backend/static/certs/corppass-client-secret.json',
    JSON.stringify({ keys: [privateJwk] }, null, 2)
  );
  
  console.log('✅ Generated ES256 signing key pair');
})();
"

# Generate ECDH-ES+A256KW encryption key pair (for ID token decryption)
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  // Generate EC P-521 key pair for encryption
  const { publicKey, privateKey } = await jose.generateKeyPair('ECDH-ES+A256KW', { 
    extractable: true,
    crv: 'P-521'
  });
  
  const privateJwk = await jose.exportJWK(privateKey);
  const publicJwk = await jose.exportJWK(publicKey);
  
  privateJwk.use = 'enc';
  privateJwk.alg = 'ECDH-ES+A256KW';
  privateJwk.kid = 'checkup-app-enc-2024';
  
  publicJwk.use = 'enc';
  publicJwk.alg = 'ECDH-ES+A256KW';
  publicJwk.kid = 'checkup-app-enc-2024';
  
  // Save private encryption key
  fs.writeFileSync(
    'backend/static/certs/corppass-client-encryption-secret.json',
    JSON.stringify(privateJwk, null, 2)
  );
  
  // Read existing public keys and add encryption key
  const signingKeys = JSON.parse(fs.readFileSync('backend/static/certs/corppass-client-secret.json'));
  const publicJwks = {
    keys: [
      signingKeys.keys[0],  // ES256 signing key (without private 'd')
      publicJwk  // ECDH-ES encryption key
    ]
  };
  
  // Remove private key material from public JWKS
  delete publicJwks.keys[0].d;
  
  fs.writeFileSync(
    'backend/static/certs/corppass-client-public.json',
    JSON.stringify(publicJwks, null, 2)
  );
  
  console.log('✅ Generated ECDH-ES+A256KW encryption key pair');
})();
"
```

### Step 4: Environment Variables

Add to your `.env` file:

```bash
# CorpPass Configuration
CORPPASS_CLIENT_ID=checkup-app
CORPPASS_CLIENT_SECRET=mockpass-secret
CORPPASS_ISSUER=http://localhost:5156/corppass/v2
CORPPASS_AUTHORIZE_URL=http://localhost:5156/corppass/v2/auth
CORPPASS_TOKEN_URL=http://localhost:5156/corppass/v2/token
CORPPASS_JWKS_URL=http://localhost:5156/corppass/v2/.well-known/keys
CORPPASS_CALLBACK_URL=http://localhost:3344/v1/auth/corppass/callback
```

### Step 5: JWKS Endpoint

Create endpoint to serve public keys for MockPass:

```typescript
// src/well-known/well-known.controller.ts

import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('.well-known')
export class WellKnownController {
  @Get('jwks.json')
  getJwks() {
    // Serve public JWKS for MockPass to verify our client assertions
    const jwksPath = path.join(process.cwd(), 'static/certs/corppass-client-public.json');
    const jwks = JSON.parse(fs.readFileSync(jwksPath, 'utf-8'));
    return jwks;
  }
}
```

Register in `app.module.ts`:

```typescript
@Module({
  controllers: [WellKnownController],
  // ...
})
export class AppModule {}
```

### Step 6: CorpPass Validator Service

```typescript
// src/auth/services/corppass-validator.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import JwksClient from 'jwks-rsa';

export interface CorpPassUserInfo {
  sub: string;
  email: string;
  name: string;
  uen?: string;
  nric?: string;
}

@Injectable()
export class CorpPassValidatorService {
  private jwksClient: JwksClient.JwksClient;
  private expectedIssuer: string;
  private expectedAudience: string;
  private jose: any;

  constructor(private configService: ConfigService) {
    const jwksUrl = this.configService.get<string>('CORPPASS_JWKS_URL');
    this.expectedIssuer = this.configService.get<string>('CORPPASS_ISSUER') || '';
    this.expectedAudience = this.configService.get<string>('CORPPASS_CLIENT_ID') || '';

    this.jwksClient = JwksClient({
      jwksUri: jwksUrl,
      cache: true,
      cacheMaxAge: 3600000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  private async loadJose() {
    if (!this.jose) {
      this.jose = await import('jose');
    }
    return this.jose;
  }

  async validateToken(idToken: string): Promise<CorpPassUserInfo> {
    try {
      const jose = await this.loadJose();
      
      const decodedHeader = jose.decodeProtectedHeader(idToken);
      const kid = decodedHeader.kid;
      
      if (!kid) {
        throw new UnauthorizedException('Token missing key ID (kid)');
      }
      
      const key = await this.jwksClient.getSigningKey(kid);
      const publicKey = key.getPublicKey();
      const cryptoKey = await jose.importSPKI(publicKey, decodedHeader.alg);
      
      const { payload } = await jose.jwtVerify(idToken, cryptoKey, {
        issuer: this.expectedIssuer,
        audience: this.expectedAudience,
      });
      
      // Extract NRIC from sub (format: s=S8979373D,uuid=...,u=...,c=SG)
      let nric = '';
      const subMatch = (payload.sub as string)?.match(/s=([^,]+)/);
      if (subMatch) {
        nric = subMatch[1];
      }
      
      const name = (payload.userInfo as any)?.CPUID_FullName || 'Unknown';
      const uen = (payload.entityInfo as any)?.CPEntID || '';
      
      // For MockPass, synthesize email from NRIC
      const email = payload.email as string || 
                    (nric ? `${nric.toLowerCase()}@corppass.gov.sg` : '');
      
      const userInfo: CorpPassUserInfo = {
        sub: payload.sub as string,
        email,
        name,
        uen,
        nric,
      };
      
      if (!userInfo.sub) {
        throw new UnauthorizedException('Token missing subject (sub) claim');
      }
      
      if (!userInfo.email && !userInfo.nric) {
        throw new UnauthorizedException('Token missing email and NRIC');
      }
      
      return userInfo;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`CorpPass token validation failed: ${error.message}`);
    }
  }
}
```

### Step 7: CorpPass OAuth Strategy

```typescript
// src/auth/strategies/corppass.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { CorpPassValidatorService } from '../services/corppass-validator.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CorpPassStrategy extends PassportStrategy(OAuth2Strategy, 'corppass') {
  private rpSecretKey: any;
  private tokenResponse: any;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private corpPassValidator: CorpPassValidatorService,
  ) {
    const authorizationURL = configService.get<string>('CORPPASS_AUTHORIZE_URL');
    const tokenURL = configService.get<string>('CORPPASS_TOKEN_URL');
    const clientID = configService.get<string>('CORPPASS_CLIENT_ID');
    const callbackURL = configService.get<string>('CORPPASS_CALLBACK_URL');

    super({
      authorizationURL,
      tokenURL,
      clientID,
      clientSecret: configService.get<string>('CORPPASS_CLIENT_SECRET') || 'mockpass-secret',
      callbackURL,
      scope: ['openid', 'email', 'profile'],
      state: false,  // We handle state manually with cookies
      skipUserProfile: false,  // We override userProfile method
    });

    // Load ES256 signing key for JWT client assertion
    try {
      const rpSecretPath = path.join(process.cwd(), 'static/certs/corppass-client-secret.json');
      const rpSecretContent = fs.readFileSync(rpSecretPath, 'utf-8');
      const jwks = JSON.parse(rpSecretContent);
      this.rpSecretKey = jwks.keys.find((key: any) => key.use === 'sig' && key.alg === 'ES256');
      
      if (!this.rpSecretKey) {
        throw new Error('ES256 signing key not found');
      }
      
      console.log('✅ Loaded ES256 signing key for CorpPass client assertion');
    } catch (error) {
      console.error('⚠️  Could not load CorpPass client signing key:', error.message);
      throw error;
    }

    // Override OAuth2 token exchange
    (this as any)._oauth2.getOAuthAccessToken = this.customGetOAuthAccessToken.bind(this);
    this.tokenResponse = null;
  }

  /**
   * Override userProfile to return token response
   */
  userProfile(accessToken: string, done: (error: any, profile?: any) => void): void {
    done(null, this.tokenResponse);
  }

  /**
   * Generate JWT client assertion for private_key_jwt authentication
   */
  private async generateClientAssertion(issuerURL: string, clientID: string): Promise<string> {
    const jose = await import('jose');
    
    const signingKey = await jose.importJWK(this.rpSecretKey, 'ES256');
    const now = Math.floor(Date.now() / 1000);
    
    const jwt = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: this.rpSecretKey.kid, typ: 'JWT' })
      .setIssuer(clientID)
      .setSubject(clientID)
      .setAudience(issuerURL)  // Use issuer URL, not token URL
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .sign(signingKey);
    
    return jwt;
  }

  /**
   * Custom token exchange with JWT client assertion
   */
  private customGetOAuthAccessToken(
    code: string,
    params: any,
    callback: (error: any, accessToken?: string, refreshToken?: string, params?: any) => void,
  ): void {
    const oauth2 = (this as any)._oauth2;
    
    (async () => {
      try {
        const tokenURL = this.configService.get<string>('CORPPASS_TOKEN_URL');
        const callbackURL = this.configService.get<string>('CORPPASS_CALLBACK_URL');
        const clientID = this.configService.get<string>('CORPPASS_CLIENT_ID');
        const issuerURL = this.configService.get<string>('CORPPASS_ISSUER');
        
        const clientAssertion = await this.generateClientAssertion(issuerURL, clientID);
        
        const postData: any = {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: callbackURL,
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: clientAssertion,
        };
        
        const postBody = Object.keys(postData)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(postData[key])}`)
          .join('&');
        
        oauth2._request(
          'POST',
          tokenURL,
          { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postBody) },
          postBody,
          null,
          (error: any, data: any, response: any) => {
            if (error) {
              callback(error);
            } else {
              try {
                const results = JSON.parse(data);
                this.tokenResponse = results;
                callback(null, results.access_token, results.refresh_token, results);
              } catch (e) {
                callback(e);
              }
            }
          },
        );
      } catch (error) {
        callback(error);
      }
    })();
  }

  /**
   * Validate OAuth callback - decrypt ID token and authenticate user
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    params: any,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    try {
      const encryptedIdToken = params.id_token;
      
      if (!encryptedIdToken) {
        throw new UnauthorizedException('No ID token received from CorpPass');
      }
      
      // Decrypt JWE ID token
      const jose = await import('jose');
      const fs = await import('fs');
      const path = await import('path');
      
      const encKeyPath = path.join(process.cwd(), 'static/certs/corppass-client-encryption-secret.json');
      const encKeyData = JSON.parse(fs.readFileSync(encKeyPath, 'utf-8'));
      const encryptionKey = await jose.importJWK(encKeyData, 'ECDH-ES+A256KW');
      
      const { plaintext } = await jose.compactDecrypt(encryptedIdToken, encryptionKey);
      const idToken = new TextDecoder().decode(plaintext);
      
      // Validate decrypted JWT
      const corpPassUserInfo = await this.corpPassValidator.validateToken(idToken);
      
      // Find or create user by NRIC
      const user = await this.authService.findOrCreateCorpPassUser(corpPassUserInfo);
      
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
```

*[Continued in next file due to length...]*

## Quick Reference

**Key Files:**
- `prisma/schema.prisma` - Database schema
- `src/common/utils/nric-validation.ts` - NRIC validation
- `static/certs/` - Cryptographic keys
- `src/well-known/well-known.controller.ts` - JWKS endpoint
- `src/auth/strategies/corppass.strategy.ts` - OAuth strategy
- `src/auth/services/corppass-validator.service.ts` - Token validation

**Key Concepts:**
- **NRIC matching**: Primary user identifier
- **JWT client assertions**: ES256 signed JWTs for authentication
- **JWE encryption**: ECDH-ES+A256KW for ID token encryption
- **Dual sessions**: OAuth flow sessions + user application sessions

**Testing Users (MockPass):**
- S1234567D - Dr. Sarah Tan (doctor)
- S2345678H - Nurse Mary Lim (nurse)
- S3456789A - Admin John Wong (admin)
