# Add CorpPass Authentication

## Why

CheckUp currently uses email/password authentication, which limits adoption by Singapore businesses. CorpPass is the **mandatory** authentication system for Singapore businesses to transact with government agencies. Adding CorpPass authentication will:

- Enable business users to log in with their corporate credentials
- Align with Singapore government digital identity standards
- Provide a more secure authentication method backed by government infrastructure
- Maintain backward compatibility with existing email/password users

## What Changes

- Add CorpPass OpenID Connect (OIDC) authentication as a **second login option** alongside email/password
- Integrate with MockPass (development) for CorpPass simulation
- Add "Login with CorpPass" button to login page
- Create new database table to store CorpPass user associations
- Implement CorpPass OAuth 2.0 authorization code flow
- Support automatic account linking by email address
- Maintain all existing email/password authentication functionality

## Impact

### Affected Specs
- `auth` - Add CorpPass authentication capability

### Affected Code
- **Backend**:
  - `src/auth/` - New CorpPass strategy, controller methods, DTOs
  - `prisma/schema.prisma` - New `CorpPassUser` model
  - `prisma/migrations/` - New migration for CorpPass table
  - New dependencies: `passport-oauth2`, `jwks-rsa`, `jose`
  
- **Frontend**:
  - `src/components/LoginPage.tsx` - Add CorpPass login button
  - `src/services/auth.service.ts` - Add CorpPass login methods
  - `src/components/AuthContext.tsx` - Handle CorpPass tokens
  
- **Infrastructure**:
  - `backend/.env.example` - Add CorpPass configuration
  - `backend/package.json` - Add OAuth dependencies
  - New service: MockPass (dev dependency)
  
- **Documentation**:
  - README.md - CorpPass setup instructions
  - New CORPPASS_SETUP.md - Detailed integration guide

### Breaking Changes

**NONE** - This is an additive change. All existing email/password authentication continues to work unchanged.

## Assumptions & Decisions

1. **User Matching Strategy**: CorpPass users will be matched to existing users by email address. If email exists, link accounts. If not, create new user with `status='pending'` requiring admin activation.

2. **Role Assignment**: New CorpPass users will have `role='nurse'` by default with `status='pending'`. Admins must activate and assign proper roles.

3. **Development Environment**: Use MockPass (localhost:5156) for development. Production will use actual CorpPass endpoints (requires CorpPass registration).

4. **Token Storage**: CorpPass tokens (id_token, access_token) stored in `corppass_users` table. CheckUp continues to issue its own JWT for session management.

5. **Security**: All CorpPass tokens validated using JWKS (JSON Web Key Set) from MockPass/CorpPass discovery endpoint.

## Open Questions

1. **Q**: Should we allow users to link both authentication methods to one account?
   **A**: YES - Users can have both email/password and CorpPass linked to same account via email matching.

2. **Q**: What happens if CorpPass email doesn't exist in system?
   **A**: Create new user with `status='pending'`, notify admins, require admin approval before access granted.

3. **Q**: Should we validate CorpPass UEN (business entity)?
   **A**: NOT IN V1 - Store UEN but don't validate. Future enhancement can add UEN-to-clinic mapping.

4. **Q**: Session expiry handling?
   **A**: CorpPass tokens expire per their own policy. CheckUp JWT expires in 24h. Users re-authenticate when either expires.
