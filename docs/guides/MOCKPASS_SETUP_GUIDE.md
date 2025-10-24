# MockPass Setup Guide

Complete guide for setting up MockPass for CorpPass v2 OIDC development testing.

## What is MockPass?

MockPass is Singapore's official simulator for testing CorpPass, SingPass, and MyInfo integrations during development. It eliminates the need for actual government credentials during development.

**Official Repository:** https://github.com/opengovsg/mockpass

## Installation

### Option 1: Local npm (Recommended for Development)

```bash
npm install --save-dev @opengovsg/mockpass
```

### Option 2: Global Installation

```bash
npm install -g @opengovsg/mockpass
```

## Configuration

### 1. Create Startup Script

Create `backend/scripts/start-mockpass.sh`:

```bash
#!/bin/bash

echo "Starting MockPass for CorpPass simulation..."
echo "MockPass will be available at http://localhost:5156"
echo ""
echo "CorpPass endpoints:"
echo "  - Authorization: http://localhost:5156/corppass/v2/authorize"
echo "  - Token:         http://localhost:5156/corppass/v2/token"
echo "  - JWKS:          http://localhost:5156/corppass/v2/.well-known/keys"
echo "  - Discovery:     http://localhost:5156/corppass/v2/.well-known/openid-configuration"
echo ""
echo "Client JWKS endpoint (for MockPass to verify our client assertions):"
echo "  - http://localhost:3344/v1/.well-known/jwks.json"
echo ""

# CRITICAL: Set SHOW_LOGIN_PAGE=true to display login form
# Without this, MockPass auto-logs in with default NRIC
PORT=5156 \
SHOW_LOGIN_PAGE=true \
CP_RP_JWKS_ENDPOINT=http://localhost:3344/v1/.well-known/jwks.json \
npx mockpass \
  --port 5156 \
  --corppass \
  --verbose
```

Make executable:

```bash
chmod +x backend/scripts/start-mockpass.sh
```

### 2. Add npm Script

In `backend/package.json`:

```json
{
  "scripts": {
    "mockpass": "./scripts/start-mockpass.sh"
  }
}
```

### 3. Environment Variables

**Key Configuration Options:**

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `PORT` or `MOCKPASS_PORT` | MockPass listening port | 5156 | No |
| `SHOW_LOGIN_PAGE` | Show login form vs auto-login | `false` | **YES** |
| `CP_RP_JWKS_ENDPOINT` | Your JWKS endpoint URL | - | **YES** |
| `MOCKPASS_NRIC` | Default NRIC for auto-login | S8979373D | No |
| `MOCKPASS_STATELESS` | Enable for serverless | `false` | No |

**Critical Settings:**

```bash
# MUST SET - Shows login page so you can choose test users
SHOW_LOGIN_PAGE=true

# MUST SET - Points to your backend's JWKS endpoint
# MockPass fetches your public keys to verify client assertions
CP_RP_JWKS_ENDPOINT=http://localhost:3344/v1/.well-known/jwks.json
```

## MockPass Endpoints

When running on port 5156:

### CorpPass v2 (OIDC) Endpoints

```
Base URL: http://localhost:5156/corppass/v2

# OpenID Configuration
GET /.well-known/openid-configuration

# JWKS (MockPass's signing keys)
GET /.well-known/keys

# Authorization endpoint (user login)
GET /auth
Parameters:
  - client_id: Your app ID (any value works)
  - redirect_uri: Your callback URL
  - scope: openid email profile
  - response_type: code
  - state: CSRF token
  - nonce: Replay prevention token

# Token endpoint (exchange code for tokens)
POST /token
Body (application/x-www-form-urlencoded):
  - grant_type: authorization_code
  - code: Authorization code from /auth
  - redirect_uri: Same as authorization
  - client_assertion_type: urn:ietf:params:oauth:client-assertion-type:jwt-bearer
  - client_assertion: Your signed JWT
```

## Authentication Methods

MockPass CorpPass v2 supports two authentication methods:

### Method 1: Client Assertion (Recommended - Production-like)

Uses JWT client assertions signed with your private key (private_key_jwt method).

**Required Setup:**
1. Generate ES256 key pair
2. Create JWKS endpoint serving public key
3. Configure `CP_RP_JWKS_ENDPOINT`
4. Sign client assertions with private key

**Advantages:**
- Matches production CorpPass behavior
- More secure than client secrets
- Tests full OIDC flow

### Method 2: Client Secret (Simple - Not Recommended)

Uses static client secret (not supported by real CorpPass).

**Setup:**
```bash
# MockPass accepts any client_id and client_secret
client_id=any-value
client_secret=any-secret
```

## MockPass Data Structure

### Default Test Users

MockPass includes default profiles. With `SHOW_LOGIN_PAGE=true`, you see a form:

**Form Fields:**
- **NRIC**: S8979373D (default) or custom
- **UUID**: Auto-generated or custom
- **UEN**: 123456789A (default) or custom

### ID Token Structure

MockPass returns encrypted JWE tokens (ECDH-ES+A256KW). After decryption:

```json
{
  "iss": "http://localhost:5156/corppass/v2",
  "aud": "your-client-id",
  "sub": "s=S8979373D,uuid=xxx,u=123456789AS8979373D,c=SG",
  "nonce": "your-nonce",
  "userInfo": {
    "CPAccType": "User",
    "CPUID_FullName": "Name of S8979373D",
    "ISSPHOLDER": "YES"
  },
  "entityInfo": {
    "CPEntID": "123456789A",
    "CPEnt_TYPE": "UEN",
    "CPEnt_Status": "Registered"
  }
}
```

**Key Claims:**
- `sub`: Contains NRIC in format `s=NRIC,uuid=...,u=...,c=SG`
- `userInfo.CPUID_FullName`: User's full name
- `entityInfo.CPEntID`: UEN (Unique Entity Number)
- **No email claim** - you must synthesize or extract from NRIC

## Key Generation for MockPass

### ES256 Signing Key (Required)

```bash
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  const { publicKey, privateKey } = await jose.generateKeyPair('ES256', { 
    extractable: true 
  });
  
  const privateJwk = await jose.exportJWK(privateKey);
  const publicJwk = await jose.exportJWK(publicKey);
  
  privateJwk.use = 'sig';
  privateJwk.alg = 'ES256';
  privateJwk.kid = 'your-app-sig-2024';
  
  publicJwk.use = 'sig';
  publicJwk.alg = 'ES256';
  publicJwk.kid = 'your-app-sig-2024';
  
  // Save keys
  fs.writeFileSync(
    'backend/static/certs/corppass-client-secret.json',
    JSON.stringify({ keys: [privateJwk] }, null, 2)
  );
  
  console.log('✅ ES256 signing key generated');
})();
"
```

### ECDH-ES+A256KW Encryption Key (Required)

```bash
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  const { publicKey, privateKey } = await jose.generateKeyPair('ECDH-ES+A256KW', { 
    extractable: true,
    crv: 'P-521'  // MUST be P-521 for ECDH-ES+A256KW
  });
  
  const privateJwk = await jose.exportJWK(privateKey);
  const publicJwk = await jose.exportJWK(publicKey);
  
  privateJwk.use = 'enc';
  privateJwk.alg = 'ECDH-ES+A256KW';
  privateJwk.kid = 'your-app-enc-2024';
  
  publicJwk.use = 'enc';
  publicJwk.alg = 'ECDH-ES+A256KW';
  publicJwk.kid = 'your-app-enc-2024';
  
  // Save private encryption key
  fs.writeFileSync(
    'backend/static/certs/corppass-client-encryption-secret.json',
    JSON.stringify(privateJwk, null, 2)
  );
  
  // Update public JWKS
  const sigKeys = JSON.parse(fs.readFileSync('backend/static/certs/corppass-client-secret.json'));
  const publicJwks = {
    keys: [
      { ...sigKeys.keys[0], d: undefined },  // Remove private key material
      publicJwk
    ]
  };
  
  fs.writeFileSync(
    'backend/static/certs/corppass-client-public.json',
    JSON.stringify(publicJwks, null, 2)
  );
  
  console.log('✅ ECDH-ES+A256KW encryption key generated');
})();
"
```

## Running MockPass

### Start MockPass

```bash
cd backend
npm run mockpass
```

**Expected Output:**
```
Starting MockPass for CorpPass simulation...
MockPass will be available at http://localhost:5156
...
MockPass listening on 5156
```

### Test MockPass is Running

```bash
# Check health
curl http://localhost:5156

# Get OIDC configuration
curl http://localhost:5156/corppass/v2/.well-known/openid-configuration

# Get MockPass's public keys
curl http://localhost:5156/corppass/v2/.well-known/keys
```

## Testing Login Flow

### 1. Start Backend

```bash
cd backend
npm run start:dev
```

### 2. Start MockPass

```bash
cd backend
npm run mockpass
```

### 3. Test Login

1. Navigate to frontend: `http://localhost:6688`
2. Click "Login with CorpPass"
3. **See MockPass login form** (if `SHOW_LOGIN_PAGE=true`)
4. Select or enter NRIC (e.g., S1234567D)
5. Submit form
6. Redirected back to app with authentication

### 4. Verify in Logs

**Backend logs should show:**
```
OAuth token response params: { access_token: ..., id_token: ... }
Decrypted ID token: eyJhbGc...
ID token claims: { sub: "s=S1234567D,...", userInfo: {...} }
```

**MockPass logs should show:**
```
Redirecting login from your-client-id to http://localhost:3344/v1/auth/corppass/callback
Received client_assertion { iss: 'your-client-id', ... }
Using encryption key { kty: 'EC', ... }
ID Token eyJhbGc... [encrypted JWE]
```

## Troubleshooting

### Issue: Auto-login without showing form

**Problem:** MockPass immediately redirects without login page

**Cause:** `SHOW_LOGIN_PAGE` not set or set to `false`

**Solution:**
```bash
# Update start-mockpass.sh to include:
SHOW_LOGIN_PAGE=true
```

### Issue: "No suitable encryption key found"

**Problem:** MockPass can't find encryption key in your JWKS

**Cause:** Missing or wrong encryption key algorithm

**Solution:**
1. Verify `CP_RP_JWKS_ENDPOINT` is set correctly
2. Check your JWKS has encryption key with `use: "enc"` and `alg: "ECDH-ES+A256KW"`
3. Ensure key curve is `P-521`

```json
{
  "keys": [
    { "use": "sig", "alg": "ES256", ... },
    { "use": "enc", "alg": "ECDH-ES+A256KW", "crv": "P-521", ... }
  ]
}
```

### Issue: "Invalid client_assertion"

**Causes:**
1. Wrong audience in client assertion (use issuer URL, not token URL)
2. Wrong algorithm (must be ES256)
3. Expired JWT (check `exp` claim)
4. MockPass can't fetch your JWKS

**Solution:**
```typescript
// Client assertion must have:
{
  iss: 'your-client-id',
  sub: 'your-client-id',
  aud: 'http://localhost:5156/corppass/v2',  // Issuer URL, NOT token URL
  iat: now,
  exp: now + 300
}
```

### Issue: "Invalid keyData" when importing JWK

**Cause:** Invalid or corrupted cryptographic key material

**Solution:** Regenerate keys using `jose.generateKeyPair()` - don't create keys manually

## Best Practices

### 1. Always Use `SHOW_LOGIN_PAGE=true`

Allows testing with different NRICs/users instead of auto-login.

### 2. Use Environment Variables, Not CLI Flags

CLI flags can be unreliable. Environment variables are more consistent:

```bash
# Good
SHOW_LOGIN_PAGE=true npx mockpass

# Less reliable
npx mockpass --show-login-page
```

### 3. Verify JWKS Endpoint is Accessible

```bash
# MockPass needs to fetch this
curl http://localhost:3344/v1/.well-known/jwks.json
```

Should return:
```json
{
  "keys": [
    { "use": "sig", "alg": "ES256", ... },
    { "use": "enc", "alg": "ECDH-ES+A256KW", ... }
  ]
}
```

### 4. Keep Keys Secure

- `.gitignore` all files in `static/certs/`
- Never commit private keys
- Rotate keys regularly in production
- Use different keys for dev/staging/prod

### 5. Test with Valid Singapore NRICs

Use the NRIC validation algorithm to generate valid test NRICs:
- S1234567D
- S2345678H
- S3456789A
- etc.

## Production vs MockPass Differences

| Feature | MockPass | Production CorpPass |
|---------|----------|---------------------|
| Client authentication | ES256 JWT or secret | ES256 JWT only |
| ID token encryption | Optional (ECDH-ES+A256KW) | Required |
| Login UI | Customizable | Fixed government UI |
| Test users | Any NRIC | Real users only |
| SSL/TLS | Optional (HTTP OK) | Required (HTTPS) |
| Email claim | Not provided | May be provided |
| Rate limiting | None | Strict limits |
| Whitelisting | Not required | IP whitelist required |

## References

- **MockPass GitHub**: https://github.com/opengovsg/mockpass
- **CorpPass Documentation**: https://www.ndi-api.gov.sg/library/trusted-access/corppass/implementation-guide
- **jose Library**: https://github.com/panva/jose
- **OAuth 2.0 RFC**: https://tools.ietf.org/html/rfc6749
- **OIDC Spec**: https://openid.net/specs/openid-connect-core-1_0.html
