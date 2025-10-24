import { ConfigService } from '@nestjs/config';
import { CorpPassValidatorService } from '../corppass-validator.service';

jest.mock('jwks-rsa', () => {
  return jest.fn().mockImplementation(() => ({
    getSigningKey: jest.fn().mockResolvedValue({ getPublicKey: () => '-----BEGIN PUBLIC KEY-----\nFAKEKEY\n-----END PUBLIC KEY-----' }),
  }));
});

describe('CorpPassValidatorService', () => {
  let service: CorpPassValidatorService;

  beforeEach(() => {
    const config = new ConfigService({
      CORPPASS_JWKS_URL: 'http://localhost:5156/corppass/v2/.well-known/keys',
      CORPPASS_ISSUER: 'http://localhost:5156/corppass/v2',
      CORPPASS_CLIENT_ID: 'client-id',
    });

    service = new CorpPassValidatorService(config);
  });

  it('should throw when token is missing kid', async () => {
    // Mock the private loadJose method to avoid dynamic import of ESM 'jose' module
    const fakeJose = {
      decodeProtectedHeader: () => ({}),
      importSPKI: jest.fn(),
      jwtVerify: jest.fn(),
      errors: {
        JWTExpired: class JWTExpired extends Error {},
        JWTClaimValidationFailed: class JWTClaimValidationFailed extends Error {},
        JWSSignatureVerificationFailed: class JWSSignatureVerificationFailed extends Error {},
      },
    } as any;

    jest.spyOn(service as any, 'loadJose').mockResolvedValue(fakeJose);

    await expect(service.validateToken('fake-token')).rejects.toThrow();
  });
});
