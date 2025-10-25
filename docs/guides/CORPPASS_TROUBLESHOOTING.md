# CorpPass Integration Troubleshooting Guide

Common issues and solutions when setting up CorpPass OIDC authentication with MockPass.

## Table of Contents

1. [MockPass Issues](#mockpass-issues)
2. [Authentication Flow Problems](#authentication-flow-problems)
3. [Session Management Issues](#session-management-issues)
4. [Cryptographic Key Problems](#cryptographic-key-problems)
5. [NRIC Validation Errors](#nric-validation-errors)
6. [Database Issues](#database-issues)
7. [Frontend Integration Problems](#frontend-integration-problems)
8. [Production Deployment Issues](#production-deployment-issues)

## MockPass Issues

### Problem: Auto-login without showing login form

**Symptoms:**
- MockPass immediately redirects without showing login page
- Always authenticates as S8979373D (default NRIC)
- Can't select different test users

**Diagnosis:**
```bash
# Check if SHOW_LOGIN_PAGE is set
cat backend/scripts/start-mockpass.sh | grep SHOW_LOGIN_PAGE
```

**Root Causes:**
1. Using CLI flag `--show-login-page` instead of environment variable
2. `SHOW_LOGIN_PAGE` not set
3. `SHOW_LOGIN_PAGE=false`

**Solutions:**

**Option 1: Environment Variable (Recommended)**
```bash
# Update backend/scripts/start-mockpass.sh
SHOW_LOGIN_PAGE=true \
PORT=5156 \
npx mockpass --corppass --verbose
```

**Option 2: Verify MockPass Version**
```bash
npm list @opengovsg/mockpass
# Should be 4.0.0 or later for best SHOW_LOGIN_PAGE support
```

**Verification:**
```bash
# Start MockPass
cd backend
npm run mockpass

# Should see output:
# [env] SHOW_LOGIN_PAGE=true

# Test in browser - should see login form at:
http://localhost:5156/corppass/v2/authorize?client_id=test&redirect_uri=http://localhost:3344/callback&response_type=code
```

---

### Problem: "No suitable encryption key found"

**Symptoms:**
- MockPass logs: "No suitable encryption key found for client"
- ID token not encrypted
- Authentication fails

**Diagnosis:**
```bash
# Check your JWKS endpoint
curl http://localhost:3344/v1/.well-known/jwks.json

# Should return JSON with two keys:
# 1. ES256 signing key (use: "sig")
# 2. ECDH-ES+A256KW encryption key (use: "enc")
```

**Root Causes:**
1. Missing encryption key in JWKS
2. Wrong algorithm (not ECDH-ES+A256KW)
3. Wrong curve (not P-521)
4. `CP_RP_JWKS_ENDPOINT` not set or unreachable

**Solutions:**

**Step 1: Verify JWKS endpoint is set**
```bash
# In start-mockpass.sh
CP_RP_JWKS_ENDPOINT=http://localhost:3344/v1/.well-known/jwks.json \
```

**Step 2: Regenerate encryption key with correct parameters**
```bash
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  // MUST use P-521 curve for ECDH-ES+A256KW
  const { publicKey, privateKey } = await jose.generateKeyPair('ECDH-ES+A256KW', {
    extractable: true,
    crv: 'P-521'  // Critical!
  });
  
  const privateJwk = await jose.exportJWK(privateKey);
  const publicJwk = await jose.exportJWK(publicKey);
  
  privateJwk.use = 'enc';
  privateJwk.alg = 'ECDH-ES+A256KW';
  privateJwk.kid = 'checkup-app-enc-2024';
  
  publicJwk.use = 'enc';
  publicJwk.alg = 'ECDH-ES+A256KW';
  publicJwk.kid = 'checkup-app-enc-2024';
  
  // Save private key
  fs.writeFileSync(
    'backend/static/certs/corppass-client-encryption-secret.json',
    JSON.stringify(privateJwk, null, 2)
  );
  
  console.log('✅ Encryption key generated');
  console.log('Public key:', JSON.stringify(publicJwk, null, 2));
})();
"
```

**Step 3: Add encryption key to public JWKS**
```typescript
// Update corppass-client-public.json
{
  "keys": [
    {
      "use": "sig",
      "alg": "ES256",
      "kid": "checkup-app-sig-2024",
      // ... ES256 public key
    },
    {
      "use": "enc",
      "alg": "ECDH-ES+A256KW",
      "kid": "checkup-app-enc-2024",
      "kty": "EC",
      "crv": "P-521",
      "x": "...",
      "y": "..."
    }
  ]
}
```

**Verification:**
```bash
# Check JWKS has both keys
curl http://localhost:3344/v1/.well-known/jwks.json | jq '.keys | length'
# Should return: 2

# Check encryption key details
curl http://localhost:3344/v1/.well-known/jwks.json | jq '.keys[] | select(.use == "enc")'
# Should show: alg: "ECDH-ES+A256KW", crv: "P-521"
```

---

### Problem: MockPass won't start or crashes

**Symptoms:**
- `npm run mockpass` fails
- Port already in use
- Module not found errors

**Diagnosis:**
```bash
# Check if port is already in use
lsof -i :5156

# Check MockPass installation
npm list @opengovsg/mockpass
```

**Solutions:**

**Port conflict:**
```bash
# Kill process using port 5156
kill -9 $(lsof -t -i:5156)

# Or use different port
PORT=5157 npx mockpass
```

**MockPass not installed:**
```bash
# Install as dev dependency
cd backend
npm install --save-dev @opengovsg/mockpass
```

**Permission issues:**
```bash
# Make script executable
chmod +x backend/scripts/start-mockpass.sh
```

---

## Authentication Flow Problems

### Problem: "Invalid client_assertion"

**Symptoms:**
- MockPass logs: "Invalid client_assertion"
- OAuth token exchange fails
- 400 Bad Request from token endpoint

**Diagnosis:**
```bash
# Enable verbose MockPass logging
MOCKPASS_VERBOSE=true npm run mockpass

# Check client assertion in backend logs
# Should see JWT with:
# - iss: your-client-id
# - sub: your-client-id
# - aud: http://localhost:5156/corppass/v2 (ISSUER URL, not token URL!)
```

**Root Causes:**
1. Wrong `aud` claim (using token URL instead of issuer URL)
2. Expired JWT (`exp` too old)
3. Wrong signing algorithm (not ES256)
4. MockPass can't fetch JWKS to verify signature

**Solutions:**

**Fix audience claim:**
```typescript
// In corppass.strategy.ts
const clientAssertion = await new jose.SignJWT({
  iss: clientId,
  sub: clientId,
  aud: issuerUrl,  // CRITICAL: Use issuer URL, NOT token URL
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 300,  // 5 minutes
  jti: generators.random(),
})
  .setProtectedHeader({ alg: 'ES256', kid: 'your-key-id' })
  .sign(privateKey);
```

**Common mistake:**
```typescript
// WRONG - Don't use token URL as audience
aud: 'http://localhost:5156/corppass/v2/token'  // ❌

// CORRECT - Use issuer URL
aud: 'http://localhost:5156/corppass/v2'  // ✅
```

**Verify JWKS endpoint is accessible from MockPass:**
```bash
# MockPass needs to fetch this to verify your signature
curl http://localhost:3344/v1/.well-known/jwks.json

# Should return your public keys
```

---

### Problem: "Cannot decrypt ID token"

**Symptoms:**
- Error: "Failed to decrypt JWE"
- "Invalid keyData"
- ID token is encrypted string (starts with "ey...")

**Diagnosis:**
```bash
# Check encrypted token format
# ID token should be in JWE format: header.encrypted_key.iv.ciphertext.tag
echo $ID_TOKEN | awk -F. '{print NF}'
# Should print: 5 (for JWE)

# Check private encryption key exists
ls -la backend/static/certs/corppass-client-encryption-secret.json
```

**Root Causes:**
1. Missing private decryption key
2. Wrong algorithm (must be ECDH-ES+A256KW with P-521)
3. Key mismatch (public/private don't match)
4. Invalid key format

**Solutions:**

**Step 1: Regenerate key pair with correct parameters**
```bash
# Use jose to generate valid keys
node --input-type=module -e "
import * as jose from 'jose';
(async () => {
  const pair = await jose.generateKeyPair('ECDH-ES+A256KW', {
    extractable: true,
    crv: 'P-521'  // MUST be P-521
  });
  console.log('Private:', await jose.exportJWK(pair.privateKey));
  console.log('Public:', await jose.exportJWK(pair.publicKey));
})();
"
```

**Step 2: Update decryption code**
```typescript
// In corppass-validator.service.ts
const encryptionKeyPath = path.join(process.cwd(), 'static/certs/corppass-client-encryption-secret.json');
const encryptionJwk = JSON.parse(fs.readFileSync(encryptionKeyPath, 'utf-8'));

// Import as CryptoKey, not raw JWK
const privateKey = await jose.importJWK(encryptionJwk, 'ECDH-ES+A256KW');

// Decrypt
const { plaintext } = await jose.compactDecrypt(idToken, privateKey);
const decodedToken = JSON.parse(new TextDecoder().decode(plaintext));
```

**Verification:**
```bash
# Test decryption manually
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

const jwe = 'YOUR_ID_TOKEN_HERE';
const key = JSON.parse(fs.readFileSync('backend/static/certs/corppass-client-encryption-secret.json'));
const privateKey = await jose.importJWK(key, 'ECDH-ES+A256KW');
const { plaintext } = await jose.compactDecrypt(jwe, privateKey);
console.log(JSON.parse(new TextDecoder().decode(plaintext)));
"
```

---

### Problem: "Account is pending approval or inactive"

**Symptoms:**
- User can login but sees error message
- Redirected with error parameter
- User exists in database with `status: 'PENDING'`

**Diagnosis:**
```sql
-- Check user status
SELECT id, name, nric, email, role, status FROM "User" WHERE nric = 'S1234567D';
```

**Root Cause:**
- New user created via CorpPass has `status: 'PENDING'`
- Requires admin approval before access

**Solutions:**

**Option 1: Activate user via SQL**
```sql
UPDATE "User" 
SET status = 'ACTIVE', role = 'DOCTOR' 
WHERE nric = 'S1234567D';
```

**Option 2: Create admin approval flow**
```typescript
// Admin endpoint to approve users
@Post('users/:id/approve')
@UseGuards(SessionGuard, AdminGuard)
async approveUser(@Param('id') id: string) {
  await this.prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      status: 'ACTIVE',
      role: 'DOCTOR',  // Or appropriate role
      updatedAt: new Date(),
    },
  });
  return { message: 'User approved' };
}
```

**Option 3: Auto-activate for known NRICs (dev only)**
```typescript
// In auth.service.ts
async findOrCreateCorpPassUser(corpPassInfo: CorpPassUserInfo) {
  // ... existing code ...

  // Auto-activate known test NRICs
  const knownNRICs = ['S1234567D', 'S2345678H', 'S3456789A'];
  const status = knownNRICs.includes(nric) ? 'ACTIVE' : 'PENDING';
  const role = knownNRICs.includes(nric) ? 'DOCTOR' : 'PENDING';

  user = await this.prisma.user.create({
    data: {
      nric,
      name,
      email,
      status,  // ACTIVE for known NRICs
      role,    // DOCTOR for known NRICs
      // ...
    },
  });
}
```

---

## Session Management Issues

### Problem: Session not persisting across requests

**Symptoms:**
- User authenticated but immediately logged out
- Session cookie not sent in subsequent requests
- Frontend shows logged out after page refresh

**Diagnosis:**
```bash
# Check if cookies are being set
curl -X GET http://localhost:3344/v1/auth/corppass/login \
  -c cookies.txt -L

cat cookies.txt
# Should show user_sid cookie

# Check if frontend sends cookies
# In browser DevTools Network tab:
# Request Headers should include: Cookie: user_sid=...
```

**Root Causes:**
1. CORS credentials not enabled
2. Frontend not sending credentials
3. Cookie domain mismatch
4. Secure flag on in HTTP environment

**Solutions:**

**Backend: Enable CORS credentials**
```typescript
// In main.ts
app.enableCors({
  origin: 'http://localhost:6688',  // Your frontend URL
  credentials: true,  // CRITICAL: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Frontend: Include credentials in all requests**
```typescript
// All fetch calls must include credentials
fetch('http://localhost:3344/v1/users/me', {
  credentials: 'include',  // Send cookies
});

// Or set globally for axios
axios.defaults.withCredentials = true;
```

**Check cookie configuration:**
```typescript
// In session middleware config
cookie: {
  httpOnly: true,
  secure: false,  // Must be false for HTTP (localhost)
  sameSite: 'lax',  // Or 'none' if cross-origin
  domain: 'localhost',  // Match your domain
}
```

---

### Problem: Session expires immediately

**Symptoms:**
- Session valid for < 1 minute
- Constant re-authentication required

**Diagnosis:**
```typescript
// Check session config in session.service.ts
console.log(configService.get('SESSION_MAX_AGE'));
// Should be 1200000 (20 minutes in milliseconds)
```

**Root Causes:**
1. `maxAge` in wrong unit (seconds vs milliseconds)
2. `maxAge` not set (defaults to session browser close)
3. Redis TTL too short

**Solutions:**

**Use milliseconds for maxAge:**
```typescript
cookie: {
  maxAge: 20 * 60 * 1000,  // 20 minutes in milliseconds
  // NOT: maxAge: 20  // Would be 20 milliseconds!
}
```

**Set in environment:**
```bash
# .env
SESSION_MAX_AGE=1200000  # 20 minutes = 20 * 60 * 1000
```

**Verify session timeout:**
```bash
# Login and get session
curl -X GET http://localhost:3344/v1/auth/corppass/login -c cookies.txt -L

# Wait 21 minutes (or advance time in tests)
sleep 1260

# Try to access protected route
curl -X GET http://localhost:3344/v1/users/me -b cookies.txt
# Should return 401 Unauthorized
```

---

## Cryptographic Key Problems

### Problem: "Invalid keyData" when importing JWK

**Symptoms:**
- Error during jose.importJWK()
- "Invalid elliptic curve point"
- Key import fails

**Root Cause:**
- Manually created JWK with invalid curve parameters
- Corrupted key file
- Wrong key format

**Solution:**

**Always use jose.generateKeyPair():**
```bash
# Never create keys manually - always use jose
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  // For signing
  const sigPair = await jose.generateKeyPair('ES256', { extractable: true });
  const sigPrivate = await jose.exportJWK(sigPair.privateKey);
  sigPrivate.use = 'sig';
  sigPrivate.alg = 'ES256';
  sigPrivate.kid = 'sig-key-2024';
  
  // For encryption
  const encPair = await jose.generateKeyPair('ECDH-ES+A256KW', {
    extractable: true,
    crv: 'P-521'
  });
  const encPrivate = await jose.exportJWK(encPair.privateKey);
  encPrivate.use = 'enc';
  encPrivate.alg = 'ECDH-ES+A256KW';
  encPrivate.kid = 'enc-key-2024';
  
  // Save
  fs.writeFileSync('sig-key.json', JSON.stringify(sigPrivate, null, 2));
  fs.writeFileSync('enc-key.json', JSON.stringify(encPrivate, null, 2));
  
  console.log('✅ Keys generated successfully');
})();
"
```

---

## NRIC Validation Errors

### Problem: "Invalid NRIC format"

**Symptoms:**
- NRIC validation fails
- Can't create users with certain NRICs

**Root Causes:**
1. Invalid checksum digit
2. Wrong format
3. Invalid prefix (not S/T/F/G/M)

**Solutions:**

**Use validation utility:**
```typescript
import { validateNRIC } from './common/utils/nric-validation';

const isValid = validateNRIC('S1234567D');
if (!isValid) {
  throw new Error('Invalid NRIC');
}
```

**Generate valid test NRICs:**
```typescript
import { generateValidNRIC } from './common/utils/nric-validation';

const nric1 = generateValidNRIC('S', '1234567');  // S1234567D
const nric2 = generateValidNRIC('S', '2345678');  // S2345678H
```

**Manual validation:**
```
NRIC Format: <PREFIX><7 DIGITS><CHECKSUM>

Prefixes:
- S/T: Singapore Citizens/PRs born before 2000
- F/G: Foreign nationals (FIN)
- M: Newer format for births after 2021

Algorithm:
1. Multiply each digit by weight: [2,7,6,5,4,3,2]
2. Sum products
3. Add offset (M series: +4)
4. Modulo 11
5. Lookup checksum in table

Example for S1234567D:
(1×2 + 2×7 + 3×6 + 4×5 + 5×4 + 6×3 + 7×2) % 11 = 3
Checksum table[3] = 'D' ✅
```

---

## Database Issues

### Problem: NRIC unique constraint violation

**Symptoms:**
- Error: "Unique constraint failed on the fields: (nric)"
- Can't create user with existing NRIC

**Diagnosis:**
```sql
SELECT id, name, nric, email FROM "User" WHERE nric = 'S1234567D';
```

**Solutions:**

**Option 1: Update existing user**
```sql
UPDATE "User" 
SET name = 'New Name', email = 'new@email.com'
WHERE nric = 'S1234567D';
```

**Option 2: Use upsert in code**
```typescript
const user = await this.prisma.user.upsert({
  where: { nric: 'S1234567D' },
  update: {
    name: 'Updated Name',
    updatedAt: new Date(),
  },
  create: {
    nric: 'S1234567D',
    name: 'New Name',
    email: 'email@example.com',
    role: 'PENDING',
    status: 'PENDING',
  },
});
```

---

## Frontend Integration Problems

### Problem: CORS errors

**Symptoms:**
- Browser console: "CORS policy blocked"
- Preflight OPTIONS request fails
- Credentials not sent

**Solutions:**

**Backend:**
```typescript
app.enableCors({
  origin: 'http://localhost:6688',  // Your frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Frontend:**
```typescript
// All requests
fetch(url, { credentials: 'include' });

// Or axios global
axios.defaults.withCredentials = true;
```

---

## Production Deployment Issues

### Problem: HTTPS required errors

**Symptoms:**
- CorpPass rejects HTTP URLs
- Redirect URI must be HTTPS

**Solution:**
- Deploy with valid SSL certificate
- Set `SESSION_COOKIE_SECURE=true`
- Update all URLs to HTTPS

---

### Problem: IP not whitelisted

**Symptoms:**
- Requests blocked by CorpPass
- 403 Forbidden from CorpPass endpoints

**Solution:**
- Register your server IPs with NDI
- Use static IPs or IP ranges
- Update whitelist when deploying new servers

---

## Getting Help

### Debug Checklist

Before asking for help, gather this info:

```bash
# 1. Version information
node --version
npm --version
npm list @opengovsg/mockpass
npm list jose

# 2. Check all services running
lsof -i :3344  # Backend
lsof -i :5156  # MockPass
lsof -i :6688  # Frontend

# 3. Environment variables
echo $SESSION_SECRET | wc -c  # Should be > 32
echo $CORPPASS_ISSUER
echo $CORPPASS_CLIENT_ID

# 4. JWKS endpoint
curl http://localhost:3344/v1/.well-known/jwks.json | jq .

# 5. Database state
psql -d checkup -c "SELECT id, nric, status, role FROM \"User\" LIMIT 5;"

# 6. Recent logs
tail -n 50 backend-logs.txt
```

### Log Debugging

**Enable verbose logging:**

**Backend:**
```typescript
// In main.ts
app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
```

**MockPass:**
```bash
MOCKPASS_VERBOSE=true npm run mockpass
```

**View logs:**
```bash
# Backend logs (NestJS)
npm run start:dev 2>&1 | tee backend.log

# Search for errors
cat backend.log | grep -i "error\|failed\|invalid"
```

---

## Additional Resources

- **Main Guide**: [CORPPASS_INTEGRATION_GUIDE.md](./CORPPASS_INTEGRATION_GUIDE.md)
- **MockPass Setup**: [MOCKPASS_SETUP_GUIDE.md](./MOCKPASS_SETUP_GUIDE.md)
- **Session Management**: [SESSION_MANAGEMENT_IMPLEMENTATION.md](./SESSION_MANAGEMENT_IMPLEMENTATION.md)
- **MockPass GitHub Issues**: https://github.com/opengovsg/mockpass/issues
- **NDI Support**: support@ndi-api.gov.sg
