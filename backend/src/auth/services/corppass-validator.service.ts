import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import JwksClient from 'jwks-rsa';

export interface CorpPassUserInfo {
  sub: string; // CorpPass unique ID
  email: string;
  name: string;
  uen?: string; // Unique Entity Number
  nric?: string; // National Registration ID
}

@Injectable()
export class CorpPassValidatorService {
  private jwksClient: JwksClient.JwksClient;
  private expectedIssuer: string;
  private expectedAudience: string;
  private jose: any; // Dynamic import of jose

  constructor(private configService: ConfigService) {
    const jwksUrl = this.configService.get<string>('CORPPASS_JWKS_URL');
    this.expectedIssuer = this.configService.get<string>('CORPPASS_ISSUER') || '';
    this.expectedAudience = this.configService.get<string>('CORPPASS_CLIENT_ID') || '';

    if (!jwksUrl || !this.expectedIssuer || !this.expectedAudience) {
      throw new Error('CorpPass configuration missing: CORPPASS_JWKS_URL, CORPPASS_ISSUER, or CORPPASS_CLIENT_ID');
    }

    this.jwksClient = JwksClient({
      jwksUri: jwksUrl,
      cache: true,
      cacheMaxAge: 3600000, // 1 hour
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  /**
   * Load jose module dynamically (ES Module)
   */
  private async loadJose() {
    if (!this.jose) {
      this.jose = await import('jose');
    }
    return this.jose;
  }

  /**
   * Validate and decode CorpPass ID token
   * @param idToken - The ID token from CorpPass
   * @returns Decoded user information
   */
  async validateToken(idToken: string): Promise<CorpPassUserInfo> {
    try {
      const jose = await this.loadJose();

      // Decode token header to get key ID (kid)
      const decodedHeader = jose.decodeProtectedHeader(idToken);
      const kid = decodedHeader.kid;

      if (!kid) {
        throw new UnauthorizedException('Token missing key ID (kid)');
      }

      // Get signing key from JWKS
      const key = await this.jwksClient.getSigningKey(kid);
      const publicKey = key.getPublicKey();

      // Validate algorithm
      if (!decodedHeader.alg) {
        throw new UnauthorizedException('Token missing algorithm (alg)');
      }

      // Convert to CryptoKey for jose
      const cryptoKey = await jose.importSPKI(publicKey, decodedHeader.alg);

      // Verify and decode token
      const { payload } = await jose.jwtVerify(idToken, cryptoKey, {
        issuer: this.expectedIssuer,
        audience: this.expectedAudience,
      });

      // Extract user info from token claims
      // CorpPass v2 structure:
      // - sub: "s=S8979373D,uuid=...,u=123456789AS8979373D,c=SG"
      // - userInfo: { CPAccType, CPUID_FullName, ISSPHOLDER }
      // - entityInfo: { CPEntID (UEN), CPEnt_TYPE, CPEnt_Status }
      
      // Extract NRIC from sub (format: s=NRIC,uuid=...,u=...,c=...)
      let nric = '';
      const subMatch = (payload.sub as string)?.match(/s=([^,]+)/);
      if (subMatch) {
        nric = subMatch[1];
      }
      
      // Extract name from userInfo
      const name = (payload.userInfo as any)?.CPUID_FullName || 'Unknown';
      
      // Extract UEN from entityInfo
      const uen = (payload.entityInfo as any)?.CPEntID || '';
      
      // For MockPass/development, synthesize email from NRIC
      // In production, real CorpPass might provide email claim
      const email = payload.email as string || 
                    payload.preferred_username as string ||
                    (nric ? `${nric.toLowerCase()}@corppass.gov.sg` : '');
      
      const userInfo: CorpPassUserInfo = {
        sub: payload.sub as string,
        email,
        name,
        uen,
        nric,
      };

      // Validate required fields
      if (!userInfo.sub) {
        throw new UnauthorizedException('Token missing subject (sub) claim');
      }

      if (!userInfo.email && !userInfo.nric) {
        throw new UnauthorizedException('Token missing email and NRIC - cannot identify user');
      }

      return userInfo;
    } catch (error) {
      const jose = await this.loadJose();
      
      if (error instanceof jose.errors.JWTExpired) {
        throw new UnauthorizedException('CorpPass token has expired');
      }
      if (error instanceof jose.errors.JWTClaimValidationFailed) {
        throw new UnauthorizedException('CorpPass token validation failed: Invalid claims');
      }
      if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
        throw new UnauthorizedException('CorpPass token validation failed: Invalid signature');
      }
      
      throw new UnauthorizedException(`CorpPass token validation failed: ${error.message}`);
    }
  }

  /**
   * Fetch CorpPass OIDC discovery configuration
   * @returns Discovery configuration
   */
  async getDiscoveryConfig(): Promise<any> {
    try {
      const discoveryUrl = this.configService.get<string>('CORPPASS_ISSUER') + '/.well-known/openid-configuration';
      const response = await fetch(discoveryUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch discovery config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new UnauthorizedException(`Failed to fetch CorpPass discovery config: ${error.message}`);
    }
  }
}
