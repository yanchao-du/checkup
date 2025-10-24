# Implementation Tasks

## 1. Setup & Dependencies

- [ ] 1.1 Install MockPass as dev dependency: `npm install -D @opengovsg/mockpass`
- [ ] 1.2 Add backend OAuth dependencies: `passport-oauth2`, `jwks-rsa`, `jose`
- [ ] 1.3 Create MockPass startup script in `backend/scripts/start-mockpass.sh`
- [ ] 1.4 Add CorpPass environment variables to `.env.example`
- [ ] 1.5 Update `package.json` scripts to run MockPass alongside backend

## 2. Database Schema

- [ ] 2.1 Create Prisma model `CorpPassUser` with fields: id, userId, corpPassSub, uen, nric, createdAt
- [ ] 2.2 Generate migration: `npx prisma migrate dev --name add_corppass_users`
- [ ] 2.3 Update seed script to include sample CorpPass associations

## 3. Backend - CorpPass Strategy

- [ ] 3.1 Create `src/auth/strategies/corppass.strategy.ts` extending Passport OAuth2Strategy
- [ ] 3.2 Implement OIDC discovery to fetch endpoints from `.well-known/openid-configuration`
- [ ] 3.3 Implement JWKS client to fetch and cache CorpPass public keys
- [ ] 3.4 Implement token validation (signature, expiry, issuer, audience)
- [ ] 3.5 Extract user info from ID token (sub, email, name, UEN, NRIC)
- [ ] 3.6 Register strategy in `auth.module.ts`

## 4. Backend - CorpPass Service Logic

- [ ] 4.1 Add method `authService.validateCorpPassUser(idToken)` to validate and decode token
- [ ] 4.2 Add method `authService.findOrCreateCorpPassUser(corpPassData)` for user matching
- [ ] 4.3 Implement email-based account linking (if email exists, link; else create pending user)
- [ ] 4.4 Add method `authService.linkCorpPassAccount(userId, corpPassSub)` for manual linking
- [ ] 4.5 Update `validateUser()` to support CorpPass-authenticated users

## 5. Backend - API Endpoints

- [ ] 5.1 Add `GET /v1/auth/corppass/authorize` - Redirect to CorpPass login
- [ ] 5.2 Add `GET /v1/auth/corppass/callback` - Handle OAuth callback, exchange code for tokens
- [ ] 5.3 Add `POST /v1/auth/corppass/login` - Complete CorpPass login, return CheckUp JWT
- [ ] 5.4 Update `GET /v1/auth/me` to include CorpPass association info
- [ ] 5.5 Add error handling for CorpPass failures (network, invalid token, etc.)

## 6. Backend - DTOs

- [ ] 6.1 Create `CorpPassCallbackDto` for callback query params (code, state)
- [ ] 6.2 Create `CorpPassUserDto` for CorpPass user data
- [ ] 6.3 Update `LoginResponseDto` to include `authMethod: 'email' | 'corppass'`
- [ ] 6.4 Create `CorpPassConfigDto` for frontend config (client_id, authorize_url)

## 7. Frontend - Login UI

- [ ] 7.1 Add "Login with CorpPass" button to `LoginPage.tsx`
- [ ] 7.2 Add visual separator between email/password and CorpPass login (e.g., "OR" divider)
- [ ] 7.3 Style CorpPass button with official CorpPass branding colors/logo
- [ ] 7.4 Add loading state for CorpPass redirect
- [ ] 7.5 Maintain existing email/password form unchanged

## 8. Frontend - CorpPass Flow

- [ ] 8.1 Add `initiateCorpPassLogin()` to `auth.service.ts` - Redirect to `/v1/auth/corppass/authorize`
- [ ] 8.2 Create `CorpPassCallback.tsx` component to handle OAuth redirect
- [ ] 8.3 Add callback route `/auth/corppass/callback` to router
- [ ] 8.4 Implement token exchange and user fetch in callback component
- [ ] 8.5 Store JWT and user data in AuthContext (same as email/password)
- [ ] 8.6 Redirect to dashboard after successful CorpPass login

## 9. Frontend - AuthContext Updates

- [ ] 9.1 Update `login()` to accept optional `authMethod` parameter
- [ ] 9.2 Add `loginWithCorpPass()` method
- [ ] 9.3 Store `authMethod` in user state
- [ ] 9.4 Display auth method in user profile/settings
- [ ] 9.5 Handle token refresh for both auth methods

## 10. Testing - Backend

- [ ] 10.1 Unit tests for `corppass.strategy.ts` (token validation, JWKS fetch)
- [ ] 10.2 Unit tests for CorpPass service methods (findOrCreate, linking)
- [ ] 10.3 E2E test for `/auth/corppass/authorize` redirect
- [ ] 10.4 E2E test for `/auth/corppass/callback` with mock code
- [ ] 10.5 E2E test for complete CorpPass login flow
- [ ] 10.6 Test error scenarios (invalid token, expired token, network failure)
- [ ] 10.7 Test account linking (existing email, new email)

## 11. Testing - Frontend

- [ ] 11.1 Cypress test: Click CorpPass button redirects to MockPass
- [ ] 11.2 Cypress test: Complete CorpPass login flow end-to-end
- [ ] 11.3 Cypress test: CorpPass user can access dashboard
- [ ] 11.4 Cypress test: Email/password login still works
- [ ] 11.5 Test error handling (callback errors, token exchange failures)

## 12. Configuration & Documentation

- [ ] 12.1 Document CorpPass environment variables in `.env.example`
- [ ] 12.2 Create `docs/guides/CORPPASS_SETUP.md` with setup instructions
- [ ] 12.3 Update main README.md with CorpPass login info
- [ ] 12.4 Add MockPass startup instructions to `backend/README.md`
- [ ] 12.5 Document production CorpPass registration process
- [ ] 12.6 Add CorpPass troubleshooting guide

## 13. Security & Validation

- [ ] 13.1 Validate all CorpPass tokens with JWKS
- [ ] 13.2 Implement state parameter for CSRF protection
- [ ] 13.3 Validate redirect_uri to prevent open redirect vulnerabilities
- [ ] 13.4 Add rate limiting to CorpPass endpoints
- [ ] 13.5 Log all CorpPass authentication attempts (success/failure)
- [ ] 13.6 Sanitize all user input from CorpPass claims

## 14. Admin Features (Optional - Nice to Have)

- [ ] 14.1 Admin UI to view pending CorpPass users
- [ ] 14.2 Admin UI to approve/reject pending users
- [ ] 14.3 Admin UI to manually link/unlink CorpPass accounts
- [ ] 14.4 Audit log for CorpPass account operations

## 15. Deployment Preparation

- [ ] 15.1 Verify MockPass runs correctly in dev environment
- [ ] 15.2 Test with multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] 15.3 Test on mobile devices (responsive design)
- [ ] 15.4 Prepare production CorpPass credentials (requires CorpPass registration)
- [ ] 15.5 Update deployment scripts/docs for production CorpPass config
- [ ] 15.6 Create rollback plan if CorpPass integration fails

## Dependencies

- Tasks 3.x depend on Task 1.2 (OAuth dependencies installed)
- Tasks 4.x depend on Task 2.2 (database migration)
- Tasks 5.x depend on Tasks 3.x and 4.x (strategy and service ready)
- Tasks 7.x and 8.x depend on Task 5.x (backend API ready)
- Tasks 10.x depend on Tasks 5.x (backend implementation complete)
- Tasks 11.x depend on Tasks 8.x (frontend implementation complete)

## Parallel Work Opportunities

- Tasks 1.x, 2.x can be done first (foundations)
- Tasks 3.x and 6.x can be done in parallel (backend strategy and DTOs)
- Tasks 7.x and 9.x can be done in parallel (frontend UI and context)
- Tasks 10.x and 11.x can be done in parallel (backend and frontend tests)
- Task 12.x can be done anytime (documentation)
