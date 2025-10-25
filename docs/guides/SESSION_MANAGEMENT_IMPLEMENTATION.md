# Session Management Implementation Guide

Complete implementation guide for production-ready dual-tier session management with CorpPass OAuth integration.

## Architecture Overview

### Dual-Tier Session System

This implementation uses **two separate session stores**:

1. **OAuth Session**: Temporary session for OAuth flow state (PKCE, nonce, state)
2. **User Session**: Persistent session after authentication (user data, permissions)

**Why Two Sessions?**
- OAuth sessions are short-lived (minutes) and contain sensitive OIDC state
- User sessions are longer-lived (20 min inactivity) and contain application state
- Separation improves security and allows different timeout policies

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─ express-session (OAuth) ──→ MemoryStore (dev) / Redis (prod)
       │  - PKCE code_verifier
       │  - OIDC nonce, state
       │  - Expires: 15 minutes
       │
       └─ express-session (User) ───→ MemoryStore (dev) / Redis (prod)
          - User ID, role, permissions
          - Clinic assignments
          - Last activity timestamp
          - Expires: 20 minutes inactivity
```

## Dependencies

```bash
npm install --save express-session
npm install --save-dev @types/express-session
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Session Configuration
SESSION_SECRET=your-super-secret-session-key-min-32-chars
SESSION_COOKIE_DOMAIN=localhost  # Or your domain
SESSION_COOKIE_SECURE=false      # Set to true in production with HTTPS
SESSION_MAX_AGE=1200000          # 20 minutes in milliseconds (20 * 60 * 1000)

# OAuth Session Configuration
OAUTH_SESSION_SECRET=different-secret-for-oauth-min-32-chars
OAUTH_SESSION_MAX_AGE=900000     # 15 minutes (15 * 60 * 1000)

# Production Redis (optional for development)
REDIS_URL=redis://localhost:6379
SESSION_STORE=memory             # 'memory' or 'redis'
```

### Generate Strong Secrets

```bash
# Generate random session secrets
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('OAUTH_SESSION_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

## Implementation

### 1. Type Definitions

Create `src/common/types/session.types.ts`:

```typescript
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    // OAuth flow data (temporary)
    code_verifier?: string;
    nonce?: string;
    state?: string;
    
    // User session data (persistent after auth)
    userId?: number;
    role?: string;
    corpPassSub?: string;
    
    // Security tracking
    lastActivity?: number;
    ipAddress?: string;
    userAgent?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  session: Session & {
    userId: number;
    role: string;
  };
}
```

### 2. Session Module Setup

Create `src/auth/session.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';

@Module({
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
```

### 3. Session Service

Create `src/auth/services/session.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import session from 'express-session';
import * as RedisStore from 'connect-redis';
import { createClient } from 'redis';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Create OAuth session middleware (for OIDC flow state)
   */
  createOAuthSessionMiddleware() {
    const secret = this.configService.get<string>('OAUTH_SESSION_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('OAUTH_SESSION_SECRET must be at least 32 characters');
    }

    return session({
      name: 'oauth_sid',  // Different cookie name than user session
      secret,
      resave: false,
      saveUninitialized: false,
      rolling: false,  // Don't extend expiry on each request
      cookie: {
        maxAge: this.configService.get<number>('OAUTH_SESSION_MAX_AGE', 900000), // 15 min
        httpOnly: true,
        secure: this.configService.get<boolean>('SESSION_COOKIE_SECURE', false),
        sameSite: 'lax',
        domain: this.configService.get<string>('SESSION_COOKIE_DOMAIN'),
      },
      store: this.createStore('oauth'),
    });
  }

  /**
   * Create user session middleware (for authenticated users)
   */
  createUserSessionMiddleware() {
    const secret = this.configService.get<string>('SESSION_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters');
    }

    return session({
      name: 'user_sid',  // Different cookie name than OAuth session
      secret,
      resave: false,
      saveUninitialized: false,
      rolling: true,  // Reset expiry on each request (inactivity timeout)
      cookie: {
        maxAge: this.configService.get<number>('SESSION_MAX_AGE', 1200000), // 20 min
        httpOnly: true,
        secure: this.configService.get<boolean>('SESSION_COOKIE_SECURE', false),
        sameSite: 'lax',
        domain: this.configService.get<string>('SESSION_COOKIE_DOMAIN'),
      },
      store: this.createStore('user'),
    });
  }

  /**
   * Create session store (memory for dev, Redis for production)
   */
  private createStore(type: 'oauth' | 'user') {
    const storeType = this.configService.get<string>('SESSION_STORE', 'memory');

    if (storeType === 'redis') {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      if (!redisUrl) {
        this.logger.warn('REDIS_URL not set, falling back to memory store');
        return undefined;  // Use default MemoryStore
      }

      try {
        const redisClient = createClient({ url: redisUrl });
        redisClient.connect().catch((err) => {
          this.logger.error(`Redis connection error: ${err.message}`);
        });

        const RedisStoreClass = RedisStore(session);
        return new RedisStoreClass({
          client: redisClient,
          prefix: `checkup:${type}:`,  // Separate namespaces
          ttl: type === 'oauth' ? 900 : 1200,  // Seconds
        });
      } catch (err) {
        this.logger.error(`Failed to create Redis store: ${err.message}`);
        return undefined;  // Fall back to memory
      }
    }

    this.logger.warn(`Using memory store for ${type} sessions (not suitable for production)`);
    return undefined;  // Express-session uses MemoryStore by default
  }

  /**
   * Store OAuth state for verification
   */
  setOAuthState(req: Request, state: { code_verifier: string; nonce: string; state: string }) {
    req.session.code_verifier = state.code_verifier;
    req.session.nonce = state.nonce;
    req.session.state = state.state;
  }

  /**
   * Retrieve and clear OAuth state
   */
  getAndClearOAuthState(req: Request) {
    const state = {
      code_verifier: req.session.code_verifier,
      nonce: req.session.nonce,
      state: req.session.state,
    };

    // Clear OAuth session data
    delete req.session.code_verifier;
    delete req.session.nonce;
    delete req.session.state;

    return state;
  }

  /**
   * Create user session after successful authentication
   */
  async createUserSession(req: Request, user: { id: number; role: string; corpPassSub?: string }) {
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.corpPassSub = user.corpPassSub;
    req.session.lastActivity = Date.now();
    req.session.ipAddress = req.ip;
    req.session.userAgent = req.get('User-Agent');

    return new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          this.logger.error(`Failed to save user session: ${err.message}`);
          reject(err);
        } else {
          this.logger.log(`User session created for user ${user.id}`);
          resolve();
        }
      });
    });
  }

  /**
   * Destroy user session (logout)
   */
  async destroyUserSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          this.logger.error(`Failed to destroy session: ${err.message}`);
          reject(err);
        } else {
          this.logger.log('User session destroyed');
          resolve();
        }
      });
    });
  }

  /**
   * Check if session is valid and update activity timestamp
   */
  validateAndRefreshSession(req: Request): boolean {
    if (!req.session.userId) {
      return false;
    }

    // Check for session hijacking (IP/User-Agent change)
    const currentIp = req.ip;
    const currentUserAgent = req.get('User-Agent');

    if (req.session.ipAddress && req.session.ipAddress !== currentIp) {
      this.logger.warn(`IP address changed for session ${req.session.userId}: ${req.session.ipAddress} -> ${currentIp}`);
      // Consider: destroy session here for strict security
    }

    if (req.session.userAgent && req.session.userAgent !== currentUserAgent) {
      this.logger.warn(`User-Agent changed for session ${req.session.userId}`);
      // Consider: destroy session here for strict security
    }

    // Update activity timestamp
    req.session.lastActivity = Date.now();

    return true;
  }
}
```

### 4. Apply Middleware in main.ts

Update `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SessionService } from './auth/services/session.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing
  app.use(cookieParser());

  // Get session service
  const sessionService = app.get(SessionService);

  // Apply OAuth session middleware (used only in auth routes)
  app.use('/v1/auth/corppass', sessionService.createOAuthSessionMiddleware());

  // Apply user session middleware globally
  app.use(sessionService.createUserSessionMiddleware());

  // Enable CORS with credentials
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:6688',
    credentials: true,  // Required for cookies
  });

  await app.listen(3344);
}
bootstrap();
```

### 5. Session Guard (Route Protection)

Create `src/auth/guards/session.guard.ts`:

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (!this.sessionService.validateAndRefreshSession(request)) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    return true;
  }
}
```

### 6. Usage in Controllers

Protect routes with session guard:

```typescript
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from './guards/session.guard';
import { Request } from 'express';

@Controller('v1/users')
export class UsersController {
  @Get('me')
  @UseGuards(SessionGuard)
  async getCurrentUser(@Req() req: Request) {
    return {
      userId: req.session.userId,
      role: req.session.role,
    };
  }

  @Post('logout')
  @UseGuards(SessionGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.sessionService.destroyUserSession(req);
    res.clearCookie('user_sid');
    return { message: 'Logged out successfully' };
  }
}
```

### 7. OAuth Flow Integration

Update `src/auth/auth.controller.ts`:

```typescript
import { Controller, Get, Req, Res, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { SessionService } from './services/session.service';
import { generators } from 'openid-client';

@Controller('v1/auth/corppass')
export class AuthController {
  constructor(private sessionService: SessionService) {}

  @Get('login')
  async initiateCorpPassLogin(@Req() req: Request, @Res() res: Response) {
    // Generate PKCE and nonce
    const code_verifier = generators.codeVerifier();
    const nonce = generators.nonce();
    const state = generators.state();

    // Store in OAuth session
    this.sessionService.setOAuthState(req, { code_verifier, nonce, state });

    // Redirect to Passport strategy
    return res.redirect(`/v1/auth/corppass?state=${state}`);
  }

  @Get()
  @UseGuards(AuthGuard('corppass'))
  async corpPassAuth() {
    // Passport handles this
  }

  @Get('callback')
  @UseGuards(AuthGuard('corppass'))
  async corpPassCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    // Clear OAuth session data
    this.sessionService.getAndClearOAuthState(req);

    // Create user session
    await this.sessionService.createUserSession(req, {
      id: user.id,
      role: user.role,
      corpPassSub: user.corpPassSub,
    });

    // Redirect to frontend
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:6688');
  }
}
```

## Security Best Practices

### 1. Session Secrets

- **Minimum 32 characters** of random data
- **Different secrets** for OAuth and user sessions
- **Rotate regularly** (every 90 days recommended)
- **Never commit** to version control

```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. Cookie Configuration

**Development:**
```typescript
{
  httpOnly: true,      // Prevent JavaScript access
  secure: false,       // HTTP OK for localhost
  sameSite: 'lax',     // CSRF protection
  domain: 'localhost'
}
```

**Production:**
```typescript
{
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // Stricter CSRF protection
  domain: '.yourdomain.com'  // Allow subdomains
}
```

### 3. Session Timeout

**20-minute inactivity timeout:**
```typescript
{
  maxAge: 1200000,  // 20 minutes
  rolling: true     // Reset on each request
}
```

**How it works:**
- User makes request → session timestamp updated → 20-min timer resets
- No activity for 20 min → session expires → user must re-authenticate
- Each request extends the session by another 20 minutes

### 4. Session Hijacking Prevention

```typescript
// Track IP and User-Agent
req.session.ipAddress = req.ip;
req.session.userAgent = req.get('User-Agent');

// Validate on each request
if (req.session.ipAddress !== req.ip) {
  // Potential hijacking - destroy session
  req.session.destroy();
  throw new UnauthorizedException('Session invalid');
}
```

### 5. Production Redis Setup

**Why Redis?**
- Memory store doesn't work with multiple server instances
- Redis provides persistent, shared session storage
- Automatic expiration of old sessions

**Docker Compose:**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass your-redis-password
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

**Environment:**
```bash
REDIS_URL=redis://:your-redis-password@localhost:6379
SESSION_STORE=redis
```

## Testing Sessions

### Manual Testing

```bash
# 1. Login
curl -X GET http://localhost:3344/v1/auth/corppass/login \
  -c cookies.txt \
  -L

# 2. Check session
curl -X GET http://localhost:3344/v1/users/me \
  -b cookies.txt

# 3. Logout
curl -X POST http://localhost:3344/v1/users/logout \
  -b cookies.txt

# 4. Verify session destroyed
curl -X GET http://localhost:3344/v1/users/me \
  -b cookies.txt
# Should return 401 Unauthorized
```

### E2E Tests

```typescript
describe('Session Management', () => {
  it('should create session after login', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/auth/corppass/login')
      .expect(302);

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('user_sid='))).toBe(true);
  });

  it('should expire after inactivity', async () => {
    // Login
    const loginResponse = await request(app.getHttpServer())
      .get('/v1/auth/corppass/login');

    const cookies = loginResponse.headers['set-cookie'];

    // Wait 21 minutes (simulated)
    jest.advanceTimersByTime(21 * 60 * 1000);

    // Try to access protected route
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Cookie', cookies)
      .expect(401);
  });

  it('should extend session on activity', async () => {
    // Login
    const loginResponse = await request(app.getHttpServer())
      .get('/v1/auth/corppass/login');

    const cookies = loginResponse.headers['set-cookie'];

    // Make request at 10 minutes
    jest.advanceTimersByTime(10 * 60 * 1000);
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Cookie', cookies)
      .expect(200);

    // Wait another 15 minutes (total 25, but timer reset at 10)
    jest.advanceTimersByTime(15 * 60 * 1000);

    // Should still be valid (< 20 min since last activity)
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Cookie', cookies)
      .expect(200);
  });
});
```

## Troubleshooting

### Issue: "Session is undefined"

**Cause:** Session middleware not applied or applied in wrong order

**Solution:** Ensure session middleware comes before routes in `main.ts`:
```typescript
app.use(cookieParser());
app.use(sessionService.createUserSessionMiddleware());
// Then define routes
```

### Issue: "Session not persisting across requests"

**Causes:**
1. Frontend not sending cookies
2. CORS credentials not enabled
3. Cookie domain mismatch

**Solutions:**
```typescript
// Backend: Enable credentials
app.enableCors({
  origin: 'http://localhost:6688',
  credentials: true,
});

// Frontend: Include credentials
fetch('http://localhost:3344/v1/users/me', {
  credentials: 'include',
});
```

### Issue: "Session expires immediately"

**Cause:** `maxAge` set too low or time unit wrong

**Solution:** Use milliseconds:
```typescript
maxAge: 20 * 60 * 1000  // 20 minutes (not 20 seconds)
```

### Issue: Redis connection errors

**Cause:** Redis not running or wrong URL

**Solution:**
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli -h localhost -p 6379 ping
# Should return: PONG

# Check environment variable
echo $REDIS_URL
```

## Production Checklist

- [ ] Generate strong random session secrets (32+ chars)
- [ ] Set `SESSION_COOKIE_SECURE=true` for HTTPS
- [ ] Use Redis for session storage (`SESSION_STORE=redis`)
- [ ] Configure Redis with password protection
- [ ] Set `sameSite: 'strict'` for cookies
- [ ] Enable session hijacking detection (IP/User-Agent validation)
- [ ] Implement session rotation on privilege escalation
- [ ] Set up Redis backup/persistence
- [ ] Monitor session store memory usage
- [ ] Configure session cleanup/garbage collection
- [ ] Test session timeout in production environment
- [ ] Document session management for team
- [ ] Set up monitoring/alerts for session errors

## References

- **express-session**: https://github.com/expressjs/session
- **connect-redis**: https://github.com/tj/connect-redis
- **OWASP Session Management**: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **Cookie Security**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security
