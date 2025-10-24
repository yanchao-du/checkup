# CorpPass Integration Documentation Index

Complete documentation set for implementing CorpPass OIDC authentication with MockPass testing and production-ready session management.

## Documentation Overview

This documentation covers the complete implementation of Singapore's CorpPass authentication system, from development setup with MockPass to production deployment.

### What You'll Learn
- ✅ Full CorpPass OIDC authentication flow
- ✅ NRIC-based user matching (Singapore standard)
- ✅ Cryptographic key generation (ES256 + ECDH-ES+A256KW)
- ✅ MockPass local development setup
- ✅ Dual-tier session management
- ✅ 20-minute inactivity timeout
- ✅ Production deployment preparation

## Quick Start

**New to CorpPass Integration?** Start here:

1. **[Quick Reference](./CORPPASS_QUICK_REFERENCE.md)** (5 min)
   - Fast commands to get running
   - Common code snippets
   - Cheat sheets

2. **[Main Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md)** (30 min)
   - Complete step-by-step implementation
   - Database schema setup
   - Full code examples

3. **[Troubleshooting Guide](./CORPPASS_TROUBLESHOOTING.md)** (as needed)
   - Common issues and solutions
   - Debug checklist
   - Error resolution

## Documentation Structure

### 📘 Core Guides

#### [CorpPass Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md)
**When to use:** Main implementation reference for complete setup

**Contents:**
- Prerequisites and dependencies
- Database schema with NRIC field
- NRIC validation implementation
- Cryptographic key generation
- JWKS endpoint setup
- CorpPass validator service
- OAuth strategy implementation
- Auth service with NRIC matching
- Frontend integration
- Testing procedures
- Production deployment checklist

**Time to complete:** 2-3 hours (first time), 30 min (with this guide)

---

#### [MockPass Setup Guide](./MOCKPASS_SETUP_GUIDE.md)
**When to use:** Setting up local CorpPass simulation

**Contents:**
- MockPass installation
- Configuration and environment variables
- Startup script creation
- Login page configuration (`SHOW_LOGIN_PAGE`)
- Test user management
- Authentication methods
- Key generation for MockPass
- Endpoint reference
- Best practices
- Production vs MockPass differences

**Key Topics:**
- Why `SHOW_LOGIN_PAGE=true` is critical
- How to configure `CP_RP_JWKS_ENDPOINT`
- Understanding MockPass data structure
- Testing with selectable NRICs

---

#### [Session Management Implementation](./SESSION_MANAGEMENT_IMPLEMENTATION.md)
**When to use:** Implementing production-ready session handling

**Contents:**
- Dual-tier session architecture
- Session module setup
- OAuth session middleware
- User session middleware
- Session service implementation
- Session guard for route protection
- Redis configuration for production
- Security best practices
- Cookie configuration
- Session timeout implementation
- Testing session flows
- Troubleshooting session issues

**Key Topics:**
- Why two separate sessions (OAuth + User)
- 20-minute inactivity timeout
- Session hijacking prevention
- Memory store vs Redis

---

#### [CorpPass Troubleshooting Guide](./CORPPASS_TROUBLESHOOTING.md)
**When to use:** When things don't work as expected

**Contents:**
- MockPass issues (auto-login, encryption keys, startup)
- Authentication flow problems (client assertions, token decryption)
- Session management issues (persistence, expiration)
- Cryptographic key problems (invalid keys, wrong algorithms)
- NRIC validation errors
- Database issues (unique constraints)
- Frontend integration problems (CORS)
- Production deployment issues
- Debug checklist
- Log debugging

**Most Common Issues:**
1. Auto-login without showing form → `SHOW_LOGIN_PAGE=true`
2. "No suitable encryption key" → Check P-521 curve for ECDH key
3. "Invalid client_assertion" → Use issuer URL, not token URL
4. Session not persisting → Enable CORS credentials
5. "Cannot decrypt ID token" → Regenerate ECDH-ES+A256KW key

---

#### [Quick Reference](./CORPPASS_QUICK_REFERENCE.md)
**When to use:** Fast lookup for common tasks

**Contents:**
- Quick start (5-minute setup)
- Common commands
- Environment variable cheat sheet
- Test users table
- API endpoints reference
- Code snippets
- Troubleshooting quick fixes
- File locations
- Testing checklist
- Production deployment checklist

**Best For:**
- Quick command lookup
- Copy-paste code snippets
- Environment configuration
- Daily development reference

---

## Documentation by Scenario

### Scenario 1: First-Time Setup

**Goal:** Get CorpPass authentication working from scratch

**Path:**
1. [Quick Reference](./CORPPASS_QUICK_REFERENCE.md) - Quick start section
2. [Main Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md) - Complete walkthrough
3. [MockPass Setup Guide](./MOCKPASS_SETUP_GUIDE.md) - MockPass configuration
4. [Session Management](./SESSION_MANAGEMENT_IMPLEMENTATION.md) - Session setup
5. [Troubleshooting](./CORPPASS_TROUBLESHOOTING.md) - Fix any issues

**Time:** 2-3 hours

---

### Scenario 2: Replicating in New Project

**Goal:** Self-service setup for another application

**Path:**
1. [Quick Reference](./CORPPASS_QUICK_REFERENCE.md) - Environment variables, commands
2. [Main Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md) - Step-by-step implementation
3. [MockPass Setup Guide](./MOCKPASS_SETUP_GUIDE.md) - Local testing
4. [Troubleshooting](./CORPPASS_TROUBLESHOOTING.md) - Common pitfalls

**Key Files to Copy:**
- `src/common/utils/nric-validation.ts`
- `src/auth/services/corppass-validator.service.ts`
- `src/auth/strategies/corppass.strategy.ts`
- `src/auth/services/session.service.ts`
- `backend/scripts/start-mockpass.sh`

**Time:** 30-60 minutes

---

### Scenario 3: Debugging Issues

**Goal:** Fix a specific problem

**Path:**
1. [Troubleshooting Guide](./CORPPASS_TROUBLESHOOTING.md) - Find your issue
2. [Quick Reference](./CORPPASS_QUICK_REFERENCE.md) - Debug commands
3. Relevant deep-dive guide (MockPass / Session / Integration)

**Time:** 5-30 minutes

---

### Scenario 4: Production Deployment

**Goal:** Deploy to production with real CorpPass

**Path:**
1. [Main Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md) - Production section
2. [Session Management](./SESSION_MANAGEMENT_IMPLEMENTATION.md) - Redis setup
3. [Quick Reference](./CORPPASS_QUICK_REFERENCE.md) - Production checklist
4. [MockPass Setup Guide](./MOCKPASS_SETUP_GUIDE.md) - Differences table

**Critical Changes:**
- Register with NDI for production `client_id`
- Generate new production cryptographic keys
- Switch from MockPass URLs to `https://id.corppass.gov.sg`
- Enable Redis session store
- Set `SESSION_COOKIE_SECURE=true`
- Configure IP whitelist

**Time:** 1-2 days (including NDI approval)

---

### Scenario 5: Understanding Architecture

**Goal:** Learn how everything works together

**Path:**
1. [Main Integration Guide](./CORPPASS_INTEGRATION_GUIDE.md) - Overview section
2. [Session Management](./SESSION_MANAGEMENT_IMPLEMENTATION.md) - Architecture overview
3. [MockPass Setup Guide](./MOCKPASS_SETUP_GUIDE.md) - MockPass data structure
4. [Quick Reference](./CORPPASS_QUICK_REFERENCE.md) - API endpoints

**Time:** 1 hour

---

## Key Concepts

### NRIC-Based Authentication
Singapore's National Registration Identity Card (NRIC) is the primary identifier for citizens and residents. CorpPass uses NRIC instead of email for user matching.

**Why NRIC?**
- Government-issued unique identifier
- More reliable than email
- Standard for Singapore government services
- CorpPass doesn't always provide email

**Implementation:**
- Database has `nric` field (unique)
- NRIC validation follows Singapore checksum algorithm
- User matching by NRIC in auth service
- Extract NRIC from CorpPass token `sub` field

**Learn More:** [Main Guide - Step 1 & 2](./CORPPASS_INTEGRATION_GUIDE.md#step-1-database-schema)

---

### Cryptographic Keys (ES256 + ECDH-ES)

Two key pairs required for CorpPass:

**1. ES256 Signing Key**
- Algorithm: Elliptic Curve Digital Signature (P-256)
- Purpose: Sign JWT client assertions
- Used for: Client authentication (private_key_jwt method)

**2. ECDH-ES+A256KW Encryption Key**
- Algorithm: Elliptic Curve Diffie-Hellman (P-521)
- Purpose: Decrypt JWE ID tokens from CorpPass
- Used for: ID token encryption

**Learn More:** [Main Guide - Step 3](./CORPPASS_INTEGRATION_GUIDE.md#step-3-generate-cryptographic-keys)

---

### Dual-Tier Sessions

Two separate session stores:

**OAuth Session** (short-lived)
- Stores PKCE `code_verifier`, `nonce`, `state`
- Expires after 15 minutes
- Used only during OAuth flow
- Cookie name: `oauth_sid`

**User Session** (long-lived)
- Stores user ID, role, permissions
- Expires after 20 minutes of inactivity
- Used for application access
- Cookie name: `user_sid`

**Why Separate?**
- Different lifetimes and security requirements
- OAuth state shouldn't persist after authentication
- User session survives longer for better UX
- Cleaner separation of concerns

**Learn More:** [Session Management Guide](./SESSION_MANAGEMENT_IMPLEMENTATION.md#architecture-overview)

---

### MockPass vs Production

| Aspect | MockPass | Production CorpPass |
|--------|----------|---------------------|
| **URL** | `http://localhost:5156` | `https://id.corppass.gov.sg` |
| **Login UI** | Customizable test form | Fixed government UI |
| **Test Users** | Any NRIC | Real users only |
| **Setup** | npm install | NDI registration |
| **IP Whitelist** | Not required | Required |
| **SSL/TLS** | Optional | Mandatory |
| **Rate Limiting** | None | Strict |

**Learn More:** [MockPass Guide](./MOCKPASS_SETUP_GUIDE.md#production-vs-mockpass-differences)

---

## Technology Stack

### Backend
- **NestJS**: Node.js framework
- **Passport**: OAuth strategy
- **jose**: JWT/JWE handling
- **express-session**: Session management
- **Prisma**: Database ORM
- **PostgreSQL**: Database

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **Axios/Fetch**: HTTP client

### Development Tools
- **MockPass**: CorpPass simulator
- **Redis** (optional dev): Session store
- **Docker**: Service orchestration

### Production Requirements
- **Redis**: Required for session storage
- **HTTPS**: SSL/TLS certificate
- **NDI Account**: CorpPass registration
- **Static IP**: For whitelisting

---

## File Structure Reference

```
project/
├── backend/
│   ├── static/certs/               # Cryptographic keys (DO NOT COMMIT)
│   │   ├── corppass-client-secret.json
│   │   ├── corppass-client-encryption-secret.json
│   │   └── corppass-client-public.json
│   ├── scripts/
│   │   └── start-mockpass.sh       # MockPass startup
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Login/callback endpoints
│   │   │   ├── auth.service.ts     # User matching logic
│   │   │   ├── guards/
│   │   │   │   └── session.guard.ts
│   │   │   ├── services/
│   │   │   │   ├── corppass-validator.service.ts
│   │   │   │   └── session.service.ts
│   │   │   └── strategies/
│   │   │       └── corppass.strategy.ts
│   │   ├── common/utils/
│   │   │   └── nric-validation.ts  # Singapore NRIC validation
│   │   ├── well-known/
│   │   │   └── well-known.controller.ts  # JWKS endpoint
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.ts                 # Test data
│   └── .env                        # Environment config
└── docs/guides/                    # This documentation
    ├── CORPPASS_INTEGRATION_GUIDE.md
    ├── MOCKPASS_SETUP_GUIDE.md
    ├── SESSION_MANAGEMENT_IMPLEMENTATION.md
    ├── CORPPASS_TROUBLESHOOTING.md
    ├── CORPPASS_QUICK_REFERENCE.md
    └── README.md                   # This file
```

---

## Common Workflows

### Daily Development

```bash
# 1. Start backend
cd backend && npm run start:dev

# 2. Start MockPass
cd backend && npm run mockpass

# 3. Start frontend
cd frontend && npm run dev

# 4. Test login flow
# Navigate to http://localhost:6688
# Click "Login with CorpPass"
# Select test NRIC
```

### Adding New Test User

```sql
-- 1. Generate valid NRIC
-- Use NRIC validation utility

-- 2. Add to database
INSERT INTO "User" (nric, name, email, role, status, "createdAt", "updatedAt")
VALUES ('S6789012E', 'Test User', 'test@example.com', 'DOCTOR', 'ACTIVE', NOW(), NOW());
```

### Debugging Auth Issues

```bash
# 1. Check all services running
lsof -i :3344 :5156 :6688

# 2. Test JWKS endpoint
curl http://localhost:3344/v1/.well-known/jwks.json | jq .

# 3. Check MockPass config
curl http://localhost:5156/corppass/v2/.well-known/openid-configuration | jq .

# 4. View logs
tail -f backend-logs.txt | grep -i "corppass\|error"
```

---

## Security Considerations

### Development
- ✅ Use different secrets for dev/prod
- ✅ Never commit private keys
- ✅ `.gitignore` all files in `static/certs/`
- ✅ Use HTTP (not HTTPS) for localhost
- ✅ `SESSION_COOKIE_SECURE=false` in dev

### Production
- ✅ Generate new cryptographic keys
- ✅ 64+ character random session secrets
- ✅ Enable HTTPS with valid certificate
- ✅ `SESSION_COOKIE_SECURE=true`
- ✅ Use Redis for session storage
- ✅ Configure IP whitelist with NDI
- ✅ Enable session hijacking detection
- ✅ Rotate secrets every 90 days
- ✅ Monitor authentication logs
- ✅ Set up error alerting

---

## Testing Strategy

### Manual Testing
1. ✅ Login flow works
2. ✅ MockPass shows login form (not auto-login)
3. ✅ Can select different NRICs
4. ✅ Session persists across page refresh
5. ✅ Logout clears session
6. ✅ Session expires after 20 min inactivity

### Automated Testing
1. ✅ Unit tests for NRIC validation
2. ✅ Unit tests for session service
3. ✅ E2E tests for OAuth flow
4. ✅ E2E tests for session timeout
5. ✅ Integration tests for auth service

### Security Testing
1. ✅ Test session hijacking detection
2. ✅ Test CSRF protection
3. ✅ Test session timeout
4. ✅ Test invalid NRIC rejection
5. ✅ Test pending user flow

---

## Next Steps After Implementation

1. **Frontend Polish**
   - Improve error messages
   - Add loading states
   - Handle edge cases

2. **Admin Features**
   - User approval workflow
   - Role management
   - Audit logging

3. **Monitoring**
   - Set up logging (Winston/Pino)
   - Add metrics (Prometheus)
   - Create dashboards (Grafana)

4. **Production Prep**
   - NDI registration
   - IP whitelist setup
   - Redis deployment
   - SSL certificate
   - Load testing

---

## Getting Help

### Internal Resources
1. This documentation set
2. Code comments in implementation files
3. Team Slack: #corppass-integration

### External Resources
1. **NDI Documentation**: https://www.ndi-api.gov.sg/library/trusted-access/corppass
2. **MockPass GitHub**: https://github.com/opengovsg/mockpass
3. **jose Library Docs**: https://github.com/panva/jose
4. **OIDC Spec**: https://openid.net/specs/openid-connect-core-1_0.html

### Support Contacts
- **NDI Support**: support@ndi-api.gov.sg
- **MockPass Issues**: https://github.com/opengovsg/mockpass/issues

---

## Maintenance

### Regular Tasks
- **Weekly**: Check for dependency updates
- **Monthly**: Review session logs for issues
- **Quarterly**: Rotate session secrets
- **Yearly**: Rotate cryptographic keys

### Updates
This documentation should be updated when:
- CorpPass API changes
- MockPass major version updates
- Security vulnerabilities discovered
- New features added
- Production issues require documentation

---

## Version History

- **v1.0** (2024): Initial complete documentation set
  - CorpPass OIDC integration
  - NRIC-based authentication
  - MockPass local development
  - Dual-tier session management
  - Production deployment guide

---

## Contributing

When updating this documentation:

1. Keep guides focused and specific
2. Include complete code examples
3. Test all commands before documenting
4. Update cross-references if structure changes
5. Add common issues to troubleshooting guide
6. Update this index when adding new guides

---

**Documentation Maintainer**: Engineering Team  
**Last Updated**: 2024  
**Status**: Production Ready ✅
