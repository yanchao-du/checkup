# CorpPass Integration Quick Reference

Fast reference for common tasks when working with CorpPass authentication, MockPass, and session management.

## Quick Start (5 Minutes)

```bash
# 1. Setup database
cd backend
npx prisma migrate dev
npx prisma db seed

# 2. Generate cryptographic keys
node --input-type=module -e "
import * as jose from 'jose';
import * as fs from 'fs';

(async () => {
  // Signing key (ES256)
  const sig = await jose.generateKeyPair('ES256', { extractable: true });
  const sigPriv = await jose.exportJWK(sig.privateKey);
  const sigPub = await jose.exportJWK(sig.publicKey);
  sigPriv.use = sigPriv.alg = sigPub.use = sigPub.alg = 'ES256';
  sigPriv.kid = sigPub.kid = 'checkup-sig-2024';

  // Encryption key (ECDH-ES+A256KW)
  const enc = await jose.generateKeyPair('ECDH-ES+A256KW', { extractable: true, crv: 'P-521' });
  const encPriv = await jose.exportJWK(enc.privateKey);
  const encPub = await jose.exportJWK(enc.publicKey);
  encPriv.use = encPriv.alg = encPub.use = encPub.alg = 'ECDH-ES+A256KW';
  encPriv.kid = encPub.kid = 'checkup-enc-2024';

  // Save keys
  fs.writeFileSync('static/certs/corppass-client-secret.json', JSON.stringify({ keys: [sigPriv] }, null, 2));
  fs.writeFileSync('static/certs/corppass-client-encryption-secret.json', JSON.stringify(encPriv, null, 2));
  fs.writeFileSync('static/certs/corppass-client-public.json', JSON.stringify({ keys: [sigPub, encPub] }, null, 2));
  
  console.log('✅ All keys generated');
})();
"

# 3. Start services
npm run start:dev        # Terminal 1
npm run mockpass         # Terminal 2

# 4. Test login
# Navigate to http://localhost:6688
# Click "Login with CorpPass"
# Select NRIC: S1234567D
# Should authenticate successfully
```

## Common Commands

### Development

```bash
# Start backend
cd backend
npm run start:dev

# Start MockPass
cd backend
npm run mockpass

# Start frontend
cd frontend
npm run dev

# Run all tests
cd backend
npm test
npm run test:e2e

# Check coverage
npm run test:cov
```

### Database

```bash
# Create migration
npx prisma migrate dev --name add_feature

# Apply migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Query users
psql -d checkup -c "SELECT id, nric, name, role, status FROM \"User\";"

# Activate pending user
psql -d checkup -c "UPDATE \"User\" SET status='ACTIVE', role='DOCTOR' WHERE nric='S1234567D';"
```

### Debugging

```bash
# Check services running
lsof -i :3344   # Backend
lsof -i :5156   # MockPass
lsof -i :6688   # Frontend

# Test JWKS endpoint
curl http://localhost:3344/v1/.well-known/jwks.json | jq .

# Test session endpoint
curl http://localhost:3344/v1/users/me \
  -H "Cookie: user_sid=YOUR_SESSION_ID"

# View MockPass config
curl http://localhost:5156/corppass/v2/.well-known/openid-configuration | jq .

# Check logs
tail -f backend.log | grep -i "error\|corppass\|session"
```

## Environment Variables Cheat Sheet

### .env (Development)

```bash
# Database
DATABASE_URL="postgresql://checkup:checkup@localhost:5432/checkup"

# CorpPass (MockPass)
CORPPASS_CLIENT_ID=checkup-app
CORPPASS_ISSUER=http://localhost:5156/corppass/v2
CORPPASS_AUTHORIZE_URL=http://localhost:5156/corppass/v2/auth
CORPPASS_TOKEN_URL=http://localhost:5156/corppass/v2/token
CORPPASS_JWKS_URL=http://localhost:5156/corppass/v2/.well-known/keys
CORPPASS_CALLBACK_URL=http://localhost:3344/v1/auth/corppass/callback

# Session
SESSION_SECRET=dev-secret-min-32-chars-random-string
OAUTH_SESSION_SECRET=different-dev-secret-min-32-chars
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_DOMAIN=localhost
SESSION_MAX_AGE=1200000
SESSION_STORE=memory

# Frontend
FRONTEND_URL=http://localhost:6688

# Server
PORT=3344
```

### .env.production

```bash
# CorpPass (Production)
CORPPASS_CLIENT_ID=your-production-client-id
CORPPASS_ISSUER=https://id.corppass.gov.sg
CORPPASS_AUTHORIZE_URL=https://id.corppass.gov.sg/auth
CORPPASS_TOKEN_URL=https://id.corppass.gov.sg/token
CORPPASS_JWKS_URL=https://id.corppass.gov.sg/.well-known/jwks.json
CORPPASS_CALLBACK_URL=https://yourdomain.com/v1/auth/corppass/callback

# Session (Production)
SESSION_SECRET=production-secret-64-chars-minimum
OAUTH_SESSION_SECRET=different-production-secret-64-chars
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_DOMAIN=.yourdomain.com
SESSION_MAX_AGE=1200000
SESSION_STORE=redis
REDIS_URL=redis://your-redis-instance:6379

# Frontend
FRONTEND_URL=https://yourdomain.com
```

## Test Users (MockPass)

| NRIC | Name | Role | Status | Password (N/A for CorpPass) |
|------|------|------|--------|----------------------------|
| S1234567D | Dr. Sarah Tan | DOCTOR | ACTIVE | - |
| S2345678H | Nurse Mary Lim | NURSE | ACTIVE | - |
| S3456789A | Admin John Wong | ADMIN | ACTIVE | - |
| S4567890C | Dr. Michael Chen | DOCTOR | ACTIVE | - |
| S5678901D | Nurse Lisa Koh | NURSE | ACTIVE | - |

All valid Singapore NRICs with correct checksums.

## API Endpoints Reference

### Authentication

```bash
# Initiate CorpPass login
GET /v1/auth/corppass/login
→ Redirects to MockPass

# CorpPass callback
GET /v1/auth/corppass/callback?code=xxx&state=yyy
→ Creates session, redirects to frontend

# Get current user
GET /v1/users/me
Headers: Cookie: user_sid=xxx
→ { id, name, email, role, nric }

# Logout
POST /v1/users/logout
Headers: Cookie: user_sid=xxx
→ { message: "Logged out successfully" }

# JWKS endpoint (public keys)
GET /v1/.well-known/jwks.json
→ { keys: [...] }
```

### MockPass

```bash
# OIDC configuration
GET http://localhost:5156/corppass/v2/.well-known/openid-configuration

# MockPass JWKS (MockPass's signing keys)
GET http://localhost:5156/corppass/v2/.well-known/keys

# Authorization (login form)
GET http://localhost:5156/corppass/v2/authorize
  ?client_id=checkup-app
  &redirect_uri=http://localhost:3344/v1/auth/corppass/callback
  &scope=openid
  &response_type=code
  &state=random-state
  &nonce=random-nonce

# Token exchange
POST http://localhost:5156/corppass/v2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
code=xxx
redirect_uri=http://localhost:3344/v1/auth/corppass/callback
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
client_assertion=SIGNED_JWT
```

## Code Snippets

### Validate NRIC

```typescript
import { validateNRIC } from './common/utils/nric-validation';

const nric = 'S1234567D';
if (!validateNRIC(nric)) {
  throw new Error('Invalid NRIC');
}
```

### Generate Valid NRIC

```typescript
import { generateValidNRIC } from './common/utils/nric-validation';

const nric = generateValidNRIC('S', '1234567');  // S1234567D
```

### Check Session in Controller

```typescript
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from './guards/session.guard';
import { Request } from 'express';

@Controller('api')
export class ApiController {
  @Get('protected')
  @UseGuards(SessionGuard)
  async protectedRoute(@Req() req: Request) {
    return {
      userId: req.session.userId,
      role: req.session.role,
    };
  }
}
```

### Frontend: Login Button

```tsx
const handleLogin = () => {
  window.location.href = 'http://localhost:3344/v1/auth/corppass/login';
};

<button onClick={handleLogin}>Login with CorpPass</button>
```

### Frontend: Fetch with Session

```typescript
const response = await fetch('http://localhost:3344/v1/users/me', {
  credentials: 'include',  // Send session cookie
});

const user = await response.json();
```

### Frontend: Logout

```typescript
const handleLogout = async () => {
  await fetch('http://localhost:3344/v1/users/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  // Clear local state
  setUser(null);
  navigate('/login');
};
```

## Troubleshooting Quick Fixes

### Auto-login without form
```bash
# Update start-mockpass.sh
SHOW_LOGIN_PAGE=true npx mockpass
```

### Session not persisting
```typescript
// Backend
app.enableCors({ origin: 'http://localhost:6688', credentials: true });

// Frontend
fetch(url, { credentials: 'include' });
```

### Invalid client_assertion
```typescript
// Use ISSUER URL, not token URL
const assertion = await new jose.SignJWT({
  iss: clientId,
  sub: clientId,
  aud: 'http://localhost:5156/corppass/v2',  // Not /token!
  // ...
});
```

### Cannot decrypt ID token
```bash
# Regenerate with P-521 curve
node --input-type=module -e "
import * as jose from 'jose';
const pair = await jose.generateKeyPair('ECDH-ES+A256KW', {
  extractable: true,
  crv: 'P-521'  // CRITICAL
});
// ... save keys
"
```

### Account pending
```sql
UPDATE "User" SET status='ACTIVE', role='DOCTOR' WHERE nric='S1234567D';
```

## File Locations

```
backend/
├── static/certs/
│   ├── corppass-client-secret.json           # ES256 signing private key
│   ├── corppass-client-encryption-secret.json # ECDH encryption private key
│   └── corppass-client-public.json            # Public JWKS (both keys)
├── scripts/
│   └── start-mockpass.sh                      # MockPass startup script
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts                 # Login/callback endpoints
│   │   ├── auth.service.ts                    # User matching logic
│   │   ├── guards/session.guard.ts            # Route protection
│   │   ├── services/
│   │   │   ├── corppass-validator.service.ts  # Token validation
│   │   │   └── session.service.ts             # Session management
│   │   └── strategies/corppass.strategy.ts    # OAuth strategy
│   ├── common/utils/
│   │   └── nric-validation.ts                 # NRIC validation
│   ├── well-known/
│   │   └── well-known.controller.ts           # JWKS endpoint
│   └── main.ts                                # App bootstrap
├── prisma/
│   ├── schema.prisma                          # Database schema
│   ├── seed.ts                                # Test data
│   └── migrations/                            # Database migrations
└── .env                                       # Environment variables

docs/guides/
├── CORPPASS_INTEGRATION_GUIDE.md              # Main implementation guide
├── MOCKPASS_SETUP_GUIDE.md                    # MockPass configuration
├── SESSION_MANAGEMENT_IMPLEMENTATION.md       # Session code
├── CORPPASS_TROUBLESHOOTING.md                # Common issues
└── CORPPASS_QUICK_REFERENCE.md                # This file
```

## Testing Checklist

### Manual Testing
- [ ] Start backend, MockPass, frontend
- [ ] Click "Login with CorpPass"
- [ ] See MockPass login form (not auto-login)
- [ ] Select NRIC S1234567D
- [ ] Redirected to dashboard
- [ ] Session persists across page refresh
- [ ] Logout works
- [ ] Session expires after 20 min inactivity

### Automated Testing
- [ ] Unit tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Coverage > 80%: `npm run test:cov`
- [ ] Linting passes: `npm run lint`

### Security Checklist
- [ ] Session secrets are random and 32+ chars
- [ ] Private keys not in version control
- [ ] HTTPS enabled in production
- [ ] `SESSION_COOKIE_SECURE=true` in production
- [ ] Redis password protected
- [ ] CORS origin restricted to your domain
- [ ] Session timeout tested
- [ ] IP/User-Agent hijacking detection enabled

## Production Deployment Checklist

- [ ] Register with NDI for production client_id
- [ ] Generate production cryptographic keys
- [ ] Set all production environment variables
- [ ] Configure IP whitelist with NDI
- [ ] Deploy Redis instance
- [ ] Enable HTTPS with valid certificate
- [ ] Test production CorpPass endpoints
- [ ] Set up monitoring/logging
- [ ] Create admin approval workflow
- [ ] Document runbook for support team
- [ ] Test session timeout in production
- [ ] Verify backup/restore procedures

## Support & Resources

### Documentation
- [Main Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md)
- [MockPass Setup](./MOCKPASS_SETUP_GUIDE.md)
- [Session Management](./SESSION_MANAGEMENT_IMPLEMENTATION.md)
- [Troubleshooting](./CORPPASS_TROUBLESHOOTING.md)

### External Resources
- **NDI Documentation**: https://www.ndi-api.gov.sg/library/trusted-access/corppass
- **MockPass GitHub**: https://github.com/opengovsg/mockpass
- **jose Library**: https://github.com/panva/jose
- **OpenID Connect Spec**: https://openid.net/specs/openid-connect-core-1_0.html

### Getting Help
- **NDI Support**: support@ndi-api.gov.sg
- **MockPass Issues**: https://github.com/opengovsg/mockpass/issues
- **Internal Team**: #corppass-integration Slack channel

---

**Last Updated:** 2024
**Version:** 1.0
**Maintainer:** Engineering Team
