# Technical Design for CorpPass Authentication

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Journey                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User → LoginPage                                           │
│     ├─ Option A: Email/Password (existing)                     │
│     └─ Option B: "Login with CorpPass" (new)                   │
│                                                                 │
│  2. CorpPass Flow:                                             │
│     User clicks "Login with CorpPass"                          │
│       ↓                                                        │
│     Frontend → GET /v1/auth/corppass/authorize                 │
│       ↓                                                        │
│     Backend → Redirect to MockPass/CorpPass login page         │
│       ↓                                                        │
│     User → Authenticates with CorpPass                         │
│       ↓                                                        │
│     CorpPass → Redirect to /auth/corppass/callback?code=xxx    │
│       ↓                                                        │
│     Frontend → POST /v1/auth/corppass/login {code}             │
│       ↓                                                        │
│     Backend → Exchange code for tokens at CorpPass             │
│       ↓                                                        │
│     Backend → Validate ID token (JWKS signature check)         │
│       ↓                                                        │
│     Backend → Find/Create user, Link CorpPass account          │
│       ↓                                                        │
│     Backend → Return CheckUp JWT token                         │
│       ↓                                                        │
│     Frontend → Store JWT, Update AuthContext                   │
│       ↓                                                        │
│     User → Redirected to Dashboard                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Database Design

### New Table: `corppass_users`

```prisma
model CorpPassUser {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  corpPassSub String   @unique @map("corppass_sub")  // CorpPass user ID
  uen         String?  // Unique Entity Number (business)
  nric        String?  // National Registration ID
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("corppass_users")
  @@index([userId])
  @@index([corpPassSub])
}
```

### Updated: `users` table

```prisma
// Add to existing User model
model User {
  // ... existing fields ...
  
  corpPassUsers CorpPassUser[]  // One user can have one CorpPass link
}
```

## Backend Components

### 1. CorpPass OAuth Strategy

**File**: `src/auth/strategies/corppass.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorpPassStrategy extends PassportStrategy(Strategy, 'corppass') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: configService.get('CORPPASS_AUTHORIZE_URL'),
      tokenURL: configService.get('CORPPASS_TOKEN_URL'),
      clientID: configService.get('CORPPASS_CLIENT_ID'),
      clientSecret: configService.get('CORPPASS_CLIENT_SECRET'),
      callbackURL: configService.get('CORPPASS_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Token validation handled separately via JWKS
    return { accessToken, refreshToken, profile };
  }
}
```

### 2. JWKS Token Validation

**File**: `src/auth/services/corppass-validator.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { JwksClient } from 'jwks-rsa';
import { jwtVerify } from 'jose';

@Injectable()
export class CorpPassValidatorService {
  private jwksClient: JwksClient;

  constructor(private configService: ConfigService) {
    const jwksUri = configService.get('CORPPASS_JWKS_URL');
    this.jwksClient = new JwksClient({ jwksUri });
  }

  async validateIdToken(idToken: string) {
    // 1. Fetch signing key from JWKS
    const decoded = jwt.decode(idToken, { complete: true });
    const key = await this.jwksClient.getSigningKey(decoded.header.kid);
    
    // 2. Verify signature and claims
    const verified = await jwtVerify(idToken, key.getPublicKey(), {
      issuer: this.configService.get('CORPPASS_ISSUER'),
      audience: this.configService.get('CORPPASS_CLIENT_ID'),
    });
    
    return verified.payload;
  }
}
```

### 3. User Matching Logic

**File**: `src/auth/auth.service.ts` (additions)

```typescript
async findOrCreateCorpPassUser(corpPassData: {
  sub: string;
  email: string;
  name: string;
  uen?: string;
  nric?: string;
}) {
  // 1. Check if CorpPass user already linked
  let corpPassUser = await this.prisma.corpPassUser.findUnique({
    where: { corpPassSub: corpPassData.sub },
    include: { user: true },
  });

  if (corpPassUser) {
    return corpPassUser.user;
  }

  // 2. Check if email matches existing user
  let user = await this.prisma.user.findUnique({
    where: { email: corpPassData.email },
  });

  if (!user) {
    // 3. Create new user (pending status)
    user = await this.prisma.user.create({
      data: {
        email: corpPassData.email,
        name: corpPassData.name,
        role: 'nurse',  // Default role
        status: 'pending',  // Requires admin approval
        passwordHash: '',  // No password for CorpPass-only users
        clinicId: DEFAULT_CLINIC_ID,  // Assign to default clinic
      },
    });
  }

  // 4. Link CorpPass account
  await this.prisma.corpPassUser.create({
    data: {
      userId: user.id,
      corpPassSub: corpPassData.sub,
      uen: corpPassData.uen,
      nric: corpPassData.nric,
    },
  });

  return user;
}
```

## Frontend Components

### 1. Login Page with CorpPass Button

**File**: `src/components/LoginPage.tsx` (additions)

```tsx
// Add above existing form
<div className="space-y-4">
  {/* CorpPass Login Button */}
  <Button
    type="button"
    variant="outline"
    className="w-full"
    onClick={handleCorpPassLogin}
  >
    <Shield className="w-4 h-4 mr-2" />
    Login with CorpPass
  </Button>

  {/* Divider */}
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-muted-foreground">
        Or continue with email
      </span>
    </div>
  </div>

  {/* Existing email/password form */}
  <form onSubmit={handleSubmit}>
    {/* ... existing form fields ... */}
  </form>
</div>
```

### 2. CorpPass Callback Handler

**File**: `src/components/CorpPassCallback.tsx`

```tsx
export function CorpPassCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithCorpPass } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`CorpPass login failed: ${error}`);
      navigate('/login');
      return;
    }

    if (code) {
      loginWithCorpPass(code)
        .then(() => {
          toast.success('Login successful');
          navigate('/dashboard');
        })
        .catch((err) => {
          toast.error('Failed to complete CorpPass login');
          navigate('/login');
        });
    }
  }, [searchParams]);

  return <div>Completing CorpPass login...</div>;
}
```

## API Endpoints

### 1. Initiate CorpPass Login

```
GET /v1/auth/corppass/authorize

Response: 302 Redirect
Location: http://localhost:5156/corppass/v2/auth?
  client_id=checkup-app&
  redirect_uri=http://localhost:6688/auth/corppass/callback&
  response_type=code&
  scope=openid+email+profile&
  state=random-state-value
```

### 2. Handle OAuth Callback

```
GET /v1/auth/corppass/callback?code=xxx&state=yyy

Response: 302 Redirect
Location: http://localhost:6688/auth/corppass/callback?code=xxx
```

### 3. Complete Login (Token Exchange)

```
POST /v1/auth/corppass/login
Content-Type: application/json

{
  "code": "authorization-code-from-corppass"
}

Response: 200 OK
{
  "token": "checkup-jwt-token",
  "user": {
    "id": "user-uuid",
    "name": "John Tan",
    "email": "john.tan@example.com",
    "role": "nurse",
    "clinicId": "clinic-uuid",
    "clinicName": "HealthFirst Clinic",
    "authMethod": "corppass"
  }
}
```

## Environment Configuration

### Development (.env)

```bash
# CorpPass Configuration (MockPass for dev)
CORPPASS_CLIENT_ID=checkup-app
CORPPASS_CLIENT_SECRET=not-needed-for-mockpass
CORPPASS_AUTHORIZE_URL=http://localhost:5156/corppass/v2/auth
CORPPASS_TOKEN_URL=http://localhost:5156/corppass/v2/token
CORPPASS_JWKS_URL=http://localhost:5156/corppass/v2/.well-known/keys
CORPPASS_ISSUER=http://localhost:5156/corppass/v2
CORPPASS_CALLBACK_URL=http://localhost:3344/v1/auth/corppass/callback
CORPPASS_FRONTEND_CALLBACK_URL=http://localhost:6688/auth/corppass/callback
```

### Production (.env.production)

```bash
# CorpPass Configuration (Production)
CORPPASS_CLIENT_ID=your-actual-client-id
CORPPASS_CLIENT_SECRET=your-actual-client-secret
CORPPASS_AUTHORIZE_URL=https://corppass.gov.sg/v2/authorize
CORPPASS_TOKEN_URL=https://corppass.gov.sg/v2/token
CORPPASS_JWKS_URL=https://corppass.gov.sg/v2/.well-known/jwks
CORPPASS_ISSUER=https://corppass.gov.sg/v2
CORPPASS_CALLBACK_URL=https://checkup.yourdomain.sg/v1/auth/corppass/callback
CORPPASS_FRONTEND_CALLBACK_URL=https://checkup.yourdomain.sg/auth/corppass/callback
```

## Security Considerations

### 1. CSRF Protection

- Generate random `state` parameter for each authorization request
- Store in session/cookie
- Validate matches on callback

### 2. Token Validation

- **MUST** validate ID token signature using JWKS
- **MUST** verify issuer matches expected CorpPass issuer
- **MUST** verify audience matches client_id
- **MUST** check token not expired
- **MUST** verify nonce if using OIDC implicit flow (not needed for auth code flow)

### 3. Redirect URI Validation

- Whitelist allowed redirect URIs in code
- Validate callback redirect_uri matches registered value
- Prevent open redirect vulnerabilities

### 4. Rate Limiting

- Limit CorpPass auth attempts per IP
- Limit callback handling to prevent replay attacks

### 5. Logging & Monitoring

- Log all CorpPass authentication attempts
- Log all token validation failures
- Monitor for suspicious patterns (multiple failed attempts)

## Error Handling

### Common Errors

| Error | Cause | User Message | Action |
|-------|-------|--------------|--------|
| `invalid_token` | ID token signature invalid | "CorpPass login failed. Please try again." | Log error, show login page |
| `token_expired` | ID token expired | "Login session expired. Please try again." | Show login page |
| `user_pending` | New CorpPass user not approved | "Your account is pending approval. Contact your administrator." | Show pending message |
| `corppass_error` | CorpPass service unavailable | "CorpPass service temporarily unavailable. Try email login." | Fallback to email |
| `account_inactive` | User account deactivated | "Your account has been deactivated." | Show inactive message |

## Testing Strategy

### 1. Unit Tests

- Token validation with valid/invalid tokens
- JWKS key fetching and caching
- User matching logic (existing email, new email)
- Account linking scenarios

### 2. Integration Tests

- Complete OAuth flow with MockPass
- Token exchange
- User creation and linking
- Error scenarios (invalid code, network failure)

### 3. E2E Tests (Cypress)

- Click CorpPass button → redirects to MockPass
- Complete login → lands on dashboard
- Email/password still works
- New CorpPass user → pending status
- Existing email → auto-linked

## Rollout Plan

### Phase 1: Development (Week 1-2)
- Set up MockPass locally
- Implement backend OAuth flow
- Implement frontend login button
- Basic testing

### Phase 2: Testing (Week 3)
- Comprehensive unit tests
- E2E tests with Cypress
- Security review
- Documentation

### Phase 3: Staging (Week 4)
- Deploy to staging environment
- Test with actual CorpPass (test environment)
- User acceptance testing
- Admin training

### Phase 4: Production (Week 5)
- Register with CorpPass production
- Deploy to production
- Monitor error rates
- Gradual rollout (feature flag?)

## Alternatives Considered

### Alternative 1: Replace Email/Password Entirely

**Rejected**: Existing users rely on email/password. CorpPass only for Singapore businesses. Keep both methods.

### Alternative 2: Use CorpPass for Authorization Only

**Rejected**: Users would need both CorpPass and email/password. Added complexity. Use CorpPass as full authentication method.

### Alternative 3: Store CorpPass Tokens in User Table

**Rejected**: Separate `corppass_users` table allows:
- Multiple auth methods per user
- Easier to add more auth methods later (SingPass, etc.)
- Cleaner separation of concerns

## Dependencies

### NPM Packages

```json
{
  "passport-oauth2": "^1.8.0",
  "jwks-rsa": "^3.1.0",
  "jose": "^5.2.0"
}
```

### Dev Dependencies

```json
{
  "@opengovsg/mockpass": "^4.5.4"
}
```

### External Services

- **MockPass** (development): Local service on port 5156
- **CorpPass** (production): Singapore government OAuth provider
