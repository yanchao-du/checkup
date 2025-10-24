# Session Management - Production Deployment Guide

## Overview

The CheckUp application implements a two-tier session management system:

1. **OAuth Session Management** - Short-lived sessions for OAuth flows (10 minutes)
2. **User Session Management** - Application sessions with inactivity timeout (20 minutes)

## Current Implementation (Development/Single Instance)

- ✅ In-memory session storage
- ✅ 20-minute inactivity timeout
- ✅ Automatic session cleanup
- ✅ Session keep-alive on activity
- ✅ Explicit logout session deletion
- ✅ CSRF protection via state/nonce

**Suitable for:** Development, staging, single-instance deployments

## Production Requirements

### For Multi-Instance/Kubernetes Deployments

**Replace in-memory storage with Redis** for session sharing across instances:

### 1. Install Redis Dependencies

```bash
npm install ioredis @nestjs/cache-manager cache-manager-ioredis-yet
```

### 2. Configure Redis Module

Create `src/redis/redis.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          ttl: 20 * 60, // 20 minutes default TTL
          // Enable TLS for production
          tls: configService.get('NODE_ENV') === 'production' ? {} : undefined,
          // Connection retry strategy
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        }),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
```

### 3. Update Session Services

Modify `src/auth/services/user-session.service.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserSessionService {
  private readonly INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
  private readonly MAX_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async createSession(
    userId: number,
    email: string,
    role: string,
    clinicId: number | null,
    authMethod: 'email' | 'corppass',
  ): Promise<string> {
    const sessionId = this.generateSecureToken();
    const now = Date.now();

    const session = {
      userId,
      email,
      role,
      clinicId,
      authMethod,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.MAX_SESSION_LIFETIME_MS,
    };

    // Store with TTL
    await this.cacheManager.set(
      `session:${sessionId}`,
      session,
      this.INACTIVITY_TIMEOUT_MS,
    );

    return sessionId;
  }

  async validateAndRefreshSession(sessionId: string): Promise<any | null> {
    const session = await this.cacheManager.get(`session:${sessionId}`);
    
    if (!session) return null;

    const now = Date.now();
    
    // Check max lifetime
    if (now > session.expiresAt) {
      await this.cacheManager.del(`session:${sessionId}`);
      return null;
    }

    // Update last activity and reset TTL
    session.lastActivity = now;
    await this.cacheManager.set(
      `session:${sessionId}`,
      session,
      this.INACTIVITY_TIMEOUT_MS,
    );

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.cacheManager.del(`session:${sessionId}`);
  }
}
```

### 4. Environment Configuration

Add to `.env`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password-here
REDIS_DB=0

# For production with TLS
REDIS_TLS_ENABLED=true
```

## Security Best Practices

### 1. Cookie Configuration (Production)

Update `src/auth/auth.controller.ts`:

```typescript
// Set session cookie with secure options
res.cookie('checkup_session', sessionId, {
  httpOnly: true,           // Prevent XSS attacks
  secure: true,             // HTTPS only in production
  sameSite: 'strict',       // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: '.checkup.sg',    // Your production domain
  path: '/',
});
```

### 2. JWT Token Configuration

**DO NOT** store sensitive data in JWT payload. Only store:
- `sessionId` - Reference to Redis session
- `iat` (issued at)
- `exp` (expiration)

The actual user data lives in Redis and is fetched on each request.

### 3. HTTPS/TLS Requirements

**Production checklist:**
- ✅ Enable HTTPS on all endpoints
- ✅ Use TLS 1.3 for Redis connections
- ✅ Set `secure: true` on all cookies
- ✅ Enable HSTS headers
- ✅ Configure proper CORS origins

### 4. Redis Security

```yaml
# redis.conf
requirepass "your-very-strong-password"
bind 127.0.0.1 ::1  # Bind to localhost only
protected-mode yes
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## Infrastructure Setup

### Option A: AWS ElastiCache (Recommended)

```terraform
resource "aws_elasticache_replication_group" "sessions" {
  replication_group_id       = "checkup-sessions"
  replication_group_description = "CheckUp user sessions"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.t4g.micro"
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_password
  
  subnet_group_name = aws_elasticache_subnet_group.sessions.name
  security_group_ids = [aws_security_group.redis.id]
}
```

### Option B: Docker Compose (Staging)

```yaml
services:
  redis:
    image: redis:7-alpine
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --save ""
      --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - checkup

volumes:
  redis-data:
```

### Option C: Kubernetes (Production)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## Session Flow Architecture

### 1. Login Flow (Email/Password or CorpPass)

```
User Login
    ↓
Auth Controller validates credentials
    ↓
UserSessionService.createSession()
    ↓
Store session in Redis with 20min TTL
    ↓
Generate JWT with sessionId
    ↓
Set httpOnly cookie
    ↓
Return user data to frontend
```

### 2. Request with Session Keep-Alive

```
API Request with JWT
    ↓
JwtAuthGuard extracts sessionId from JWT
    ↓
UserSessionService.validateAndRefreshSession()
    ↓
Check if session exists in Redis
    ↓
Check if inactive > 20min → Delete & Return 401
    ↓
Update lastActivity timestamp
    ↓
Reset Redis TTL to 20min (keep-alive)
    ↓
Attach user data to request
    ↓
Process request
```

### 3. Logout Flow

```
User clicks Logout
    ↓
POST /auth/logout
    ↓
Extract sessionId from JWT
    ↓
UserSessionService.deleteSession()
    ↓
Delete from Redis
    ↓
Clear cookie
    ↓
Return success
```

## Monitoring & Observability

### 1. Session Metrics

Track these metrics in production:

```typescript
// Add to UserSessionService
async getMetrics(): Promise<SessionMetrics> {
  const keys = await this.cacheManager.store.keys('session:*');
  
  return {
    activeSessions: keys.length,
    sessionsByAuthMethod: {
      email: await this.countByAuthMethod('email'),
      corppass: await this.countByAuthMethod('corppass'),
    },
    avgSessionDuration: await this.calculateAvgDuration(),
  };
}
```

### 2. CloudWatch/DataDog Dashboard

Monitor:
- Active sessions count
- Session creation rate
- Session timeout rate
- Redis connection health
- Redis memory usage
- Average session duration

### 3. Alerting Rules

Set up alerts for:
- Redis connection failures
- Session count > 10,000 (potential attack)
- High session timeout rate (UX issue)
- Redis memory > 80%

## Testing

### Load Testing Script

```javascript
// k6 load test
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  // Login
  const loginRes = http.post('https://api.checkup.sg/v1/auth/login', {
    email: 'test@example.com',
    password: 'password',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'session cookie set': (r) => r.cookies.checkup_session !== undefined,
  });

  // Make authenticated requests
  const token = loginRes.json('token');
  const headers = { Authorization: `Bearer ${token}` };
  
  // Simulate activity every 5 minutes (keep-alive)
  http.get('https://api.checkup.sg/v1/users/me', { headers });
}
```

## Migration Path

### Phase 1: Deploy with In-Memory (Current)
- ✅ Single instance deployments
- ✅ Development/staging environments

### Phase 2: Add Redis (Before Multi-Instance)
- Install Redis dependencies
- Update session services
- Test session persistence
- Deploy Redis infrastructure

### Phase 3: Enable Multi-Instance
- Deploy multiple backend instances
- Configure load balancer
- Verify session sharing works
- Monitor session metrics

## Security Checklist

Before production deployment:

- [ ] Enable HTTPS/TLS everywhere
- [ ] Set secure cookie flags (`httpOnly`, `secure`, `sameSite`)
- [ ] Use strong Redis password (32+ characters)
- [ ] Enable Redis AUTH and TLS
- [ ] Configure proper CORS origins
- [ ] Implement rate limiting (prevent brute force)
- [ ] Add session anomaly detection
- [ ] Enable audit logging for auth events
- [ ] Configure proper backup/restore for Redis
- [ ] Test session timeout scenarios
- [ ] Test logout from all devices
- [ ] Verify session hijacking protections

## Cost Estimation

**AWS ElastiCache (Singapore Region):**
- cache.t4g.micro (2 nodes): ~SGD 30/month
- Data transfer: ~SGD 10/month
- **Total: ~SGD 40/month**

**Alternative: Redis Cloud (Managed):**
- 500MB instance: ~USD 7/month
- Includes replication, backups, monitoring

## Support & Troubleshooting

Common issues:

1. **Sessions not persisting across instances**
   - Verify Redis connectivity from all pods
   - Check Redis AUTH configuration
   - Verify network policies allow Redis traffic

2. **Frequent session timeouts**
   - Check Redis maxmemory-policy (should be allkeys-lru)
   - Verify TTL refresh on activity
   - Monitor Redis memory usage

3. **Slow session validation**
   - Add Redis connection pooling
   - Enable Redis pipelining
   - Consider Redis cluster for horizontal scaling
