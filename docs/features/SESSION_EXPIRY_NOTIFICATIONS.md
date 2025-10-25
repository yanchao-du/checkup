# Session Expiry Notifications Feature

**Status:** ✅ Implemented  
**Date:** October 24, 2025  
**Related:** Session Management, User Authentication

## Overview

Automatic logout with user-friendly notifications when sessions expire due to inactivity or maximum lifetime limits.

## Features

### 1. Backend Session Validation

**File:** `backend/src/auth/services/user-session.service.ts`

**Session Timeouts:**
- **Inactivity Timeout:** 20 minutes (configurable)
- **Maximum Lifetime:** 24 hours

**Error Messages:**
```typescript
// Session not found
throw new UnauthorizedException('Session not found. Please sign in again.');

// Maximum lifetime exceeded
throw new UnauthorizedException('Session expired (maximum lifetime reached). Please sign in again.');

// Inactivity timeout
throw new UnauthorizedException('Session expired due to inactivity. Please sign in again.');
```

**Key Changes:**
- Changed `validateAndRefreshSession()` return type from `UserSession | null` to `UserSession`
- Now throws `UnauthorizedException` with specific messages instead of returning `null`
- Backend automatically deletes expired sessions from storage

### 2. Frontend Session Handling

**File:** `frontend/src/lib/api-client.ts`

**Custom Event System:**
```typescript
export const SESSION_EXPIRED_EVENT = 'session-expired';

export const dispatchSessionExpired = (message: string) => {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));
};
```

**401 Response Handler:**
```typescript
if (response.status === 401) {
  // Get error message from backend
  const errorData = await response.json().catch(() => ({ 
    message: 'Your session has expired' 
  }));
  const message = errorData.message || 'Your session has expired';
  
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Dispatch event with message
  dispatchSessionExpired(message);
  
  // Redirect to login
  window.location.href = '/';
  throw new Error(message);
}
```

### 3. Toast Notification Display

**File:** `frontend/src/components/AuthContext.tsx`

**Event Listener:**
```typescript
useEffect(() => {
  const handleSessionExpired = (event: CustomEvent) => {
    const message = event.detail?.message || 'Your session has expired';
    
    // Show toast notification
    toast.warning(message, {
      duration: 5000,
      description: 'Please sign in again to continue',
    });
    
    // Clear user state
    setUser(null);
  };

  window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);

  return () => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);
  };
}, []);
```

## User Experience Flow

### Scenario 1: Inactivity Timeout (20 minutes)

1. **User logs in** → Session created with `lastActivity` timestamp
2. **User inactive for 20 minutes** → No API requests made
3. **User tries to perform action** → API request with expired session
4. **Backend validates session:**
   ```typescript
   const inactiveFor = now - session.lastActivity;
   if (inactiveFor > this.INACTIVITY_TIMEOUT_MS) {
     this.sessions.delete(sessionId);
     throw new UnauthorizedException('Session expired due to inactivity. Please sign in again.');
   }
   ```
5. **Frontend receives 401:**
   - API client extracts error message
   - Dispatches `SESSION_EXPIRED_EVENT`
   - Clears local storage
   - Redirects to login
6. **AuthContext event handler:**
   - Shows toast: ⚠️ "Session expired due to inactivity"
   - Description: "Please sign in again to continue"
   - Clears user state
7. **User sees notification and login page**

### Scenario 2: Maximum Lifetime (24 hours)

1. **User logs in** → Session created with `expiresAt` timestamp (now + 24 hours)
2. **24 hours pass** → Even with activity, session exceeds max lifetime
3. **User tries to perform action** → API request
4. **Backend validates session:**
   ```typescript
   if (now > session.expiresAt) {
     this.sessions.delete(sessionId);
     throw new UnauthorizedException('Session expired (maximum lifetime reached). Please sign in again.');
   }
   ```
5. **Same frontend flow as above** with different message

### Scenario 3: Session Keep-Alive (Activity Extension)

1. **User active** → Making API requests
2. **Each request:** Backend updates `session.lastActivity = Date.now()`
3. **20-minute timer resets** → User stays logged in
4. **Example:**
   - Login at 10:00 AM
   - Activity at 10:15 AM → timer resets
   - Activity at 10:30 AM → timer resets
   - No activity until 10:55 AM → Session expires (25 min since 10:30)

## Toast Notification Appearance

**Visual Design (using Sonner):**

```
┌──────────────────────────────────────────────┐
│ ⚠️  Session expired due to inactivity        │
│                                              │
│ Please sign in again to continue            │
│                                              │
│ Duration: 5 seconds                          │
└──────────────────────────────────────────────┘
```

**Toast Configuration:**
- **Type:** Warning (yellow/orange color)
- **Duration:** 5000ms (5 seconds)
- **Position:** Top right (Sonner default)
- **Message:** Backend error message
- **Description:** "Please sign in again to continue"

## Technical Implementation Details

### Event-Driven Architecture

**Why Custom Events?**
- API client is low-level (no React hooks)
- AuthContext is high-level (React component)
- Events bridge the gap without tight coupling
- Allows multiple listeners if needed

**Flow:**
```
API Client (401 response)
  ↓
dispatchSessionExpired(message)
  ↓
CustomEvent: SESSION_EXPIRED_EVENT
  ↓
AuthContext event listener
  ↓
toast.warning(message)
```

### Error Message Propagation

```
Backend (NestJS)
  ↓ UnauthorizedException('Session expired due to inactivity')
  ↓
HTTP 401 Response { message: 'Session expired due to inactivity' }
  ↓
Frontend API Client
  ↓ await response.json()
  ↓ errorData.message
  ↓
CustomEvent detail: { message: '...' }
  ↓
Toast notification
```

## Configuration

### Backend Configuration

**File:** `backend/src/auth/services/user-session.service.ts`

```typescript
// Adjust timeout values
private readonly INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;  // 20 minutes
private readonly MAX_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;  // 24 hours
```

**Environment Variables (future):**
```bash
SESSION_INACTIVITY_TIMEOUT_MS=1200000  # 20 minutes
SESSION_MAX_LIFETIME_MS=86400000       # 24 hours
```

### Frontend Configuration

**File:** `frontend/src/components/AuthContext.tsx`

```typescript
// Adjust toast duration
toast.warning(message, {
  duration: 5000,  // 5 seconds
  description: 'Please sign in again to continue',
});
```

## Testing

### Manual Testing

**Test Inactivity Timeout:**
1. Login to application
2. Wait 20 minutes without any interaction
3. Try to navigate or perform action
4. ✅ Should see toast notification
5. ✅ Should be redirected to login page

**Test Keep-Alive:**
1. Login to application
2. Every 15 minutes, click around or refresh data
3. Session should stay alive
4. ✅ Should NOT be logged out

**Test Maximum Lifetime:**
1. Login to application
2. Use app continuously for 24+ hours (or temporarily reduce MAX_SESSION_LIFETIME_MS)
3. Try to perform action after 24 hours
4. ✅ Should see "maximum lifetime" toast
5. ✅ Should be logged out

### Automated Testing

**Backend Unit Test:**
```typescript
describe('UserSessionService', () => {
  it('should throw UnauthorizedException for inactive session', () => {
    const sessionId = service.createSession(1, 'test@example.com', 'doctor', null, 'email');
    
    // Fast-forward time by 21 minutes
    jest.advanceTimersByTime(21 * 60 * 1000);
    
    expect(() => service.validateAndRefreshSession(sessionId))
      .toThrow('Session expired due to inactivity');
  });
});
```

**Frontend Integration Test (Cypress):**
```typescript
describe('Session Expiry', () => {
  it('should show notification on session expiry', () => {
    cy.login('test@example.com', 'password');
    
    // Mock 401 response with expiry message
    cy.intercept('GET', '/v1/auth/me', {
      statusCode: 401,
      body: { message: 'Session expired due to inactivity. Please sign in again.' }
    });
    
    // Trigger API call
    cy.visit('/dashboard');
    
    // Check toast appeared
    cy.contains('Session expired due to inactivity').should('be.visible');
    cy.contains('Please sign in again to continue').should('be.visible');
    
    // Check redirected to login
    cy.url().should('include', '/login');
  });
});
```

## Security Considerations

### Session Cleanup

**Backend automatically cleans up expired sessions:**
```typescript
// Runs every 5 minutes
setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
```

**Benefits:**
- Prevents memory leaks in development (in-memory store)
- Prepares for Redis migration in production
- Reduces attack surface (old sessions deleted)

### Token Clearing

**Frontend clears all auth data on expiry:**
```typescript
localStorage.removeItem('token');
localStorage.removeItem('user');
setUser(null);
```

**Prevents:**
- Stale token usage
- Invalid state between logout and login
- Security vulnerabilities from cached data

## Production Considerations

### Redis Session Store

**When using Redis in production:**
```typescript
// Redis automatically handles TTL (Time To Live)
await redisClient.set(`session:${sessionId}`, JSON.stringify(session), {
  EX: Math.ceil(INACTIVITY_TIMEOUT_MS / 1000)  // Expires in 1200 seconds (20 min)
});
```

**On each request:**
```typescript
// Redis refreshes TTL automatically if using GETEX
await redisClient.getEx(`session:${sessionId}`, {
  EX: Math.ceil(INACTIVITY_TIMEOUT_MS / 1000)
});
```

### Monitoring

**Metrics to track:**
- Session expiry rate (normal vs abnormal)
- Average session duration
- Number of "inactivity" vs "max lifetime" expirations
- Failed API requests due to expired sessions

**Alerts:**
- Spike in session expirations (potential issue)
- Sessions expiring too quickly (misconfiguration)
- High rate of 401 errors (session problems)

## Future Enhancements

### 1. Warning Before Expiry

**Show warning 2 minutes before session expires:**
```typescript
// Check remaining time on each request
const remainingTime = INACTIVITY_TIMEOUT_MS - (now - session.lastActivity);

if (remainingTime < 2 * 60 * 1000 && remainingTime > 0) {
  // Send header: X-Session-Expires-In: 120
  response.setHeader('X-Session-Expires-In', Math.floor(remainingTime / 1000));
}
```

**Frontend countdown:**
```typescript
// Show toast: "Session expires in 2 minutes. Click to stay signed in."
toast.warning('Your session will expire soon', {
  duration: Infinity,
  action: {
    label: 'Stay Signed In',
    onClick: () => apiClient.get('/auth/ping')  // Refresh session
  }
});
```

### 2. Remember Me Option

**Extend session for "Remember Me" users:**
```typescript
// 30-day session for remember-me users
const maxLifetime = rememberMe 
  ? 30 * 24 * 60 * 60 * 1000  // 30 days
  : 24 * 60 * 60 * 1000;      // 24 hours
```

### 3. Multiple Device Management

**Show active sessions in user settings:**
```
Current Sessions:
- Chrome on MacBook Pro (This device)
  Last active: 2 minutes ago
- Safari on iPhone
  Last active: 1 hour ago
  [Revoke Session]
```

## Related Documentation

- [Session Management Implementation](../guides/SESSION_MANAGEMENT_IMPLEMENTATION.md)
- [User Authentication Flow](./USER_AUTHENTICATION.md)
- [CorpPass Integration](../guides/CORPPASS_INTEGRATION_GUIDE.md)

## Changelog

**v1.0 - October 24, 2025**
- ✅ Implemented backend session validation with specific error messages
- ✅ Changed inactivity timeout to 20 minutes
- ✅ Added custom event system for session expiry
- ✅ Integrated toast notifications with Sonner
- ✅ Added AuthContext event listener
- ✅ Updated API client to dispatch events on 401
