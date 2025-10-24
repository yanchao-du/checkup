import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { CorpPassValidatorService } from '../services/corppass-validator.service';
import { AuthService } from '../auth.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CorpPassStrategy extends PassportStrategy(Strategy, 'corppass') {
  private rpSecretKey: any;

  constructor(
    private configService: ConfigService,
    private corpPassValidator: CorpPassValidatorService,
    private authService: AuthService,
  ) {
    const authorizationURL = configService.get<string>('CORPPASS_AUTHORIZE_URL');
    const tokenURL = configService.get<string>('CORPPASS_TOKEN_URL');
    const clientID = configService.get<string>('CORPPASS_CLIENT_ID');
    const callbackURL = configService.get<string>('CORPPASS_CALLBACK_URL');

    if (!authorizationURL || !tokenURL || !clientID || !callbackURL) {
      throw new Error('CorpPass OAuth configuration missing');
    }

    super({
      authorizationURL,
      tokenURL,
      clientID,
      clientSecret: configService.get<string>('CORPPASS_CLIENT_SECRET') || 'mockpass-secret',
      callbackURL,
      scope: ['openid', 'email', 'profile'],
      state: false, // Disable built-in state management, we handle it manually with cookies
      skipUserProfile: false, // MUST be false so params are passed to validate
    });

    // Load ES256 signing key for JWT client assertion
    // MockPass CorpPass v2 requires ES256, but the default RP secret uses ES512
    // So we use our own ES256 key pair
    try {
      const rpSecretPath = path.join(
        process.cwd(),
        'static/certs/corppass-client-secret.json',
      );
      const rpSecretContent = fs.readFileSync(rpSecretPath, 'utf-8');
      const jwks = JSON.parse(rpSecretContent);
      // Get the ES256 signing key
      this.rpSecretKey = jwks.keys.find((key: any) => key.use === 'sig' && key.alg === 'ES256');
      
      if (!this.rpSecretKey) {
        throw new Error('ES256 signing key not found in corppass-client-secret.json');
      }
      
      console.log('✅ Loaded ES256 signing key for CorpPass client assertion');
    } catch (error) {
      console.error('⚠️  Could not load CorpPass client signing key:', error.message);
      console.error('   Client assertion authentication will not work');
      throw error;
    }

    // Override the OAuth2 token exchange to use JWT client assertion
    (this as any)._oauth2.getOAuthAccessToken = this.customGetOAuthAccessToken.bind(this);
    
    // Store token response for later use
    this.tokenResponse = null;
  }
  
  private tokenResponse: any;

  /**
   * Override userProfile to return the token response (which contains id_token)
   * This is called by passport-oauth2 after token exchange
   */
  userProfile(accessToken: string, done: (error: any, profile?: any) => void): void {
    // Return the stored token response as the "profile"
    // This will be passed to validate() as the params parameter
    done(null, this.tokenResponse);
  }

  /**
   * Generate JWT client assertion for private_key_jwt authentication
   * @param issuerURL - The CorpPass issuer URL (base URL, not token endpoint)
   * @param clientID - Client ID
   */
  private async generateClientAssertion(issuerURL: string, clientID: string): Promise<string> {
    if (!this.rpSecretKey) {
      throw new Error('RP secret key not loaded, cannot generate client assertion');
    }

    // Dynamically import jose (ES Module)
    const jose = await import('jose');

    // Import the JWK as a signing key
    const privateKey = await jose.importJWK(this.rpSecretKey, this.rpSecretKey.alg);

    // Create JWT client assertion
    // aud MUST be the issuer URL, not the token endpoint URL
    const jwt = await new jose.SignJWT({})
      .setProtectedHeader({
        alg: this.rpSecretKey.alg,
        kid: this.rpSecretKey.kid,
        typ: 'JWT',
      })
      .setIssuer(clientID)
      .setSubject(clientID)
      .setAudience(issuerURL) // Use issuer URL, not token URL
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(privateKey);

    return jwt;
  }

  /**
   * Custom token exchange using JWT client assertion (private_key_jwt)
   * This is required by MockPass CorpPass v2 OIDC
   */
  private async customGetOAuthAccessToken(code: string, params: any, callback: any): Promise<void> {
    try {
      const oauth2 = (this as any)._oauth2;
      const tokenURL = this.configService.get<string>('CORPPASS_TOKEN_URL');
      const issuerURL = this.configService.get<string>('CORPPASS_ISSUER');
      const clientID = this.configService.get<string>('CORPPASS_CLIENT_ID');
      const callbackURL = this.configService.get<string>('CORPPASS_CALLBACK_URL');

      if (!tokenURL || !issuerURL || !clientID || !callbackURL) {
        throw new Error('CorpPass configuration incomplete');
      }

      // Generate JWT client assertion with issuer URL as audience
      const clientAssertion = await this.generateClientAssertion(issuerURL, clientID);

      // Build form-urlencoded body with client assertion
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
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postBody),
        },
        postBody,
        null,
        (error: any, data: any, response: any) => {
          if (error) {
            callback(error);
          } else {
            try {
              const results = JSON.parse(data);
              // Store token response for userProfile method
              this.tokenResponse = results;
              // Pass results as both refresh_token AND params
              // Since skipUserProfile is true, passport-oauth2 expects: (accessToken, refreshToken, profile, done)
              // We pass the full token response as the "profile" parameter
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
  }

  /**
   * Validate the OAuth callback and exchange code for tokens
   * @param accessToken - Access token from CorpPass
   * @param refreshToken - Refresh token from CorpPass
   * @param params - Additional params including id_token
   * @param done - Passport callback
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    params: any,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    try {
      // Debug: Log what we received
      console.log('OAuth token response params:', JSON.stringify(params, null, 2));
      
      // Extract encrypted ID token from params
      const encryptedIdToken = params.id_token;
      
      if (!encryptedIdToken) {
        throw new UnauthorizedException('No ID token received from CorpPass');
      }

      // Decrypt the JWE (JSON Web Encryption) ID token
      const jose = await import('jose');
      const fs = await import('fs');
      const path = await import('path');
      
      // Load private encryption key
      const encKeyPath = path.join(process.cwd(), 'static/certs/corppass-client-encryption-secret.json');
      const encKeyData = JSON.parse(fs.readFileSync(encKeyPath, 'utf-8'));
      const encryptionKey = await jose.importJWK(encKeyData, 'ECDH-ES+A256KW');
      
      // Decrypt the JWE to get the actual JWT
      const { plaintext } = await jose.compactDecrypt(encryptedIdToken, encryptionKey);
      const idToken = new TextDecoder().decode(plaintext);
      
      console.log('Decrypted ID token:', idToken);
      
      // Decode without verification to see what's inside
      const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      console.log('ID token claims:', JSON.stringify(decoded, null, 2));
      
      // Validate and decode the decrypted ID token using JWKS
      const corpPassUserInfo = await this.corpPassValidator.validateToken(idToken);

      // Find or create user based on CorpPass info
      const user = await this.authService.findOrCreateCorpPassUser(corpPassUserInfo);

      // Return user to Passport
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
