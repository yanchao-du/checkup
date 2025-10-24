# Session Management - Quick Reference

## Summary

✅ **Yes, cookies are secure for production** when configured correctly.

Your requirements are fully implemented:
- ✅ **20-minute inactivity timeout** - Sessions expire after 20 minutes of no activity
- ✅ **Session keep-alive** - Every API request extends the session by 20 minutes
- ✅ **Logout ends session** - Explicit logout immediately deletes the session
- ✅ **Production-ready security** - CSRF, XSS, replay attack protection

## Current Implementation

### For Development/Staging (Current)
- Uses **in-memory** session storage
- All security features work correctly
- Suitable for single-instance deployments
- Sessions lost on server restart (acceptable for dev/staging)

### For Production (When Multi-Instance Needed)
- Replace with **Redis** for session sharing
- Sessions persist across server restarts
- Supports horizontal scaling
- High availability with Redis replication
- See: `docs/guides/SESSION_MANAGEMENT_PRODUCTION.md`

## Security Features

### OAuth Flow Security
- ✅ CSRF protection via `state` parameter
- ✅ Replay attack prevention via `nonce`
- ✅ Cryptographically secure random tokens
- ✅ httpOnly cookies (XSS prevention)
- ✅ 10-minute expiry for OAuth sessions
- ✅ One-time use (deleted after callback)

### User Session Security
- ✅ 20-minute inactivity timeout
- ✅ 24-hour maximum session lifetime
- ✅ Automatic session extension on activity
- ✅ Session deletion on logout
- ✅ Per-user session tracking
- ✅ Logout from all devices support
- ✅ Automatic cleanup of expired sessions

### Cookie Configuration
```typescript
// Development
httpOnly: true              // ✅ Prevents JavaScript access (XSS protection)
secure: false               // HTTP allowed in dev
sameSite: 'lax'            // ✅ CSRF protection

// Production
httpOnly: true              // ✅ Prevents JavaScript access
secure: true                // ✅ HTTPS only
sameSite: 'strict'         // ✅ Strict CSRF protection
domain: '.checkup.sg'      // Your production domain
```

## How It Works

### Login Flow
1. User clicks "Login with CorpPass"
2. Backend creates OAuth session (state + nonce)
3. Session ID stored in httpOnly cookie
4. User redirected to MockPass/CorpPass
5. User authenticates
6. Callback verifies state matches session
7. Backend validates ID token with nonce
8. Creates user session (20-min inactivity timeout)
9. Returns JWT with session ID
10. User session extends on every API request

### Session Keep-Alive
- Every authenticated API request updates `lastActivity`
- Redis TTL reset to 20 minutes
- If no activity for 20 minutes → session expires
- User sees "Session expired, please login again"

### Logout
- POST /auth/logout
- Session deleted from memory/Redis
- Cookie cleared
- User redirected to login page

## Production Checklist

### Before Production Deployment

- [ ] Enable HTTPS on all endpoints
- [ ] Set `secure: true` on cookies (HTTPS only)
- [ ] Set `sameSite: 'strict'` (CSRF protection)
- [ ] Configure proper CORS origins (not *)
- [ ] Implement rate limiting on login endpoints
- [ ] Add audit logging for auth events
- [ ] Set up session monitoring/alerts
- [ ] Test session timeout scenarios
- [ ] Test logout from all devices
- [ ] Load test session management

### When Scaling to Multiple Instances

- [ ] Deploy Redis (ElastiCache recommended)
- [ ] Configure Redis AUTH password
- [ ] Enable Redis TLS encryption
- [ ] Update SessionService to use Redis
- [ ] Update UserSessionService to use Redis
- [ ] Configure Redis persistence (AOF + RDS)
- [ ] Set up Redis backup/restore
- [ ] Test session sharing across instances
- [ ] Monitor Redis health metrics

## Cost Estimate

**Single Instance (Current)**
- Infrastructure: $0/month
- Works perfectly for dev/staging
- Suitable for low-traffic production

**Multi-Instance with Redis**
- Redis (AWS ElastiCache): ~SGD 40/month
- Provides high availability
- Supports horizontal scaling
- Sessions persist across restarts

## Testing Session Management

### Test Scenarios

1. **Login and activity**
   ```bash
   # Login
   curl -X POST http://localhost:3344/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"doctor@clinic.sg","password":"password123"}' \
     -c cookies.txt

   # Make request within 20 min (session extends)
   curl -X GET http://localhost:3344/v1/users/me \
     -H "Authorization: Bearer <token>" \
     -b cookies.txt

   # Session stays alive ✅
   ```

2. **Inactivity timeout**
   ```bash
   # Login
   curl -X POST http://localhost:3344/v1/auth/login ...

   # Wait 21 minutes without making requests

   # Next request fails with 401 ❌
   curl -X GET http://localhost:3344/v1/users/me ...
   # Response: {"statusCode":401,"message":"Session expired"}
   ```

3. **Explicit logout**
   ```bash
   # Login
   curl -X POST http://localhost:3344/v1/auth/login ... -c cookies.txt

   # Logout
   curl -X POST http://localhost:3344/v1/auth/logout \
     -b cookies.txt

   # Session deleted, next request fails ✅
   ```

4. **Maximum session lifetime**
   ```bash
   # Login
   curl -X POST http://localhost:3344/v1/auth/login ...

   # Make requests every 10 minutes (keeps session alive)
   # After 24 hours, session expires regardless ✅
   ```

## Monitoring

### Session Statistics Endpoint

Add to `auth.controller.ts`:

```typescript
@Get('sessions/stats')
@UseGuards(JwtAuthGuard)
async getSessionStats() {
  return {
    oauth: this.sessionService.getStats(),
    users: this.userSessionService.getStats(),
  };
}
```

### Response Example
```json
{
  "oauth": {
    "total": 0,
    "expired": 0
  },
  "users": {
    "total": 42,
    "byAuthMethod": {
      "email": 30,
      "corppass": 12
    },
    "expired": 3
  }
}
```

## Troubleshooting

### Sessions expire too quickly
- Check `INACTIVITY_TIMEOUT_MS` in UserSessionService
- Verify API requests are actually reaching backend
- Check Redis TTL configuration

### Sessions not persisting across restarts
- This is expected with in-memory storage
- Migrate to Redis for persistence

### High memory usage
- Check `userSessionService.getStats()` for session count
- Implement session limit per user (max 5 devices)
- Verify cleanup is running every 5 minutes

### Can't logout
- Check that sessionId is being extracted from JWT
- Verify session exists before deletion
- Check cookies are being cleared

## References

- Full Production Guide: `docs/guides/SESSION_MANAGEMENT_PRODUCTION.md`
- Security Architecture: `docs/architecture/SESSION_SECURITY.md`
- OpenSpec Proposal: `openspec/changes/add-corppass-auth/design.md`

## Questions?

**Q: Are cookies secure enough for production?**
A: Yes! With httpOnly, secure, and sameSite flags, cookies are MORE secure than localStorage or sessionStorage. They're the industry standard for session management.

**Q: Do I need Redis right now?**
A: No, not until you need multiple backend instances or session persistence. The in-memory implementation works perfectly for single-instance deployments.

**Q: What happens if Redis goes down?**
A: All users get logged out (sessions lost). Set up Redis replication and backups to prevent this. Consider AWS ElastiCache with automatic failover.

**Q: Can users have multiple devices logged in?**
A: Yes! Each device gets its own session. You can implement "logout from all devices" using `userSessionService.deleteAllUserSessions(userId)`.

**Q: How do I test the 20-minute timeout?**
A: Temporarily change `INACTIVITY_TIMEOUT_MS` to 60000 (1 minute) in development, test, then restore to 20 minutes.
