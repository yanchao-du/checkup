# Session Timeout Implementation Guide

A complete guide for implementing automatic session timeout with inactivity detection, proactive logout, and user notifications in a NestJS + React application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Common Pitfalls](#common-pitfalls)

---

## Overview

### What This Implements

✅ **Automatic logout after inactivity** (configurable timeout)  
✅ **Proactive session checking** (heartbeat mechanism)  
✅ **User notifications** (toast messages)  
✅ **Graceful redirect** (back to login page)  
✅ **Session keep-alive** (on real user activity)  
✅ **Maximum session lifetime** (24 hours)  

### Key Requirements

- NestJS backend with Passport JWT authentication
- React frontend with context-based auth state
- Toast notifications (using Sonner or similar)
- Modern browser with fetch API support

---

## Architecture

### Session Flow Diagram

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Create User Session        │
│  - sessionId (secure token) │
│  - userId, email, role      │
│  - lastActivity: now        │
│  - expiresAt: now + 24h     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Create JWT with sessionId  │
│  payload: {                 │
│    sub, email, role,        │
│    sessionId ← IMPORTANT    │
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend Stores JWT        │
│  localStorage.setItem()     │
└──────┬──────────────────────┘
       │
       ├────────────────────────────────────┐
       │                                    │
       ▼                                    ▼
┌─────────────────┐              ┌──────────────────┐
│  Heartbeat      │              │  User Actions    │
│  Every 10s      │              │  (Clicks, etc)   │
│  X-Heartbeat:   │              │  No X-Heartbeat  │
│  true           │              │  header          │
└────┬────────────┘              └────┬─────────────┘
     │                                │
     │  ┌─────────────────────────────┘
     │  │
     ▼  ▼
┌─────────────────────────────┐
│  JWT Auth Guard             │
│  → JWT Strategy             │
│  → Validate Session         │
│                             │
│  if (isHeartbeat):          │
│    Check validity only      │
│  else:                      │
│    Check + update activity  │
└──────┬──────────────────────┘
       │
       ├──────────────┬─────────────┐
       │              │             │
       ▼              ▼             ▼
   Valid &        Valid &       Expired
   Updated        Not Updated   (> timeout)
   ✅             ✅            ❌
       │              │             │
       │              │             ▼
       │              │      ┌──────────────┐
       │              │      │ Throw 401    │
       │              │      │ Unauthorized │
       │              │      └──────┬───────┘
       │              │             │
       │              │             ▼
       │              │      ┌──────────────┐
       │              │      │ Frontend:    │
       │              │      │ - Toast      │
       │              │      │ - Redirect   │
       │              │      └──────────────┘
       ▼              ▼
   Continue      Continue
   (timer reset) (timer same)
```

### Critical Components

1. **UserSession** - In-memory (or Redis) session store
2. **JWT Strategy** - Validates session on every request
3. **Heartbeat** - Proactive session checking without keeping alive
4. **isHeartbeat Flag** - Distinguishes automated checks from user activity
5. **Cache-Control Headers** - Prevents browser caching

---

## Backend Implementation

### Step 1: Create User Session Service

**File:** `backend/src/auth/services/user-session.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserSession {
  userId: string;
  email: string;
  role: string;
  clinicId: string | null;
  authMethod: 'email' | 'corppass';
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

@Injectable()
export class UserSessionService {
  private sessions = new Map<string, UserSession>();
  
  // CONFIGURATION
  private readonly INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
  private readonly MAX_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private configService: ConfigService) {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Create a new user session
   */
  createSession(
    userId: string,
    email: string,
    role: string,
    clinicId: string | null,
    authMethod: 'email' | 'corppass',
  ): string {
    const sessionId = this.generateSecureToken();
    const now = Date.now();

    const session: UserSession = {
      userId,
      email,
      role,
      clinicId,
      authMethod,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.MAX_SESSION_LIFETIME_MS,
    };

    this.sessions.set(sessionId, session);
    console.log(`✅ Created session ${sessionId} for user ${email}`);

    return sessionId;
  }

  /**
   * CRITICAL: Validate session with isHeartbeat flag
   * 
   * @param sessionId - Session ID from JWT
   * @param isHeartbeat - If true, don't update lastActivity
   * @returns User session data if valid
   * @throws UnauthorizedException if session is expired or invalid
   */
  validateAndRefreshSession(sessionId: string, isHeartbeat = false): UserSession {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found. Please sign in again.');
    }

    const now = Date.now();

    // Check maximum lifetime
    if (now > session.expiresAt) {
      this.sessions.delete(sessionId);
      throw new UnauthorizedException('Session expired (maximum lifetime reached).');
    }

    // Check inactivity timeout
    const inactiveFor = now - session.lastActivity;
    if (inactiveFor > this.INACTIVITY_TIMEOUT_MS) {
      this.sessions.delete(sessionId);
      const inactiveSeconds = Math.round(inactiveFor / 1000);
      console.log(`⏰ Session ${sessionId} expired (${inactiveSeconds}s inactive)`);
      throw new UnauthorizedException('Session expired due to inactivity. Please sign in again.');
    }

    // CRITICAL: Only update lastActivity if NOT a heartbeat
    if (!isHeartbeat) {
      session.lastActivity = now;
      this.sessions.set(sessionId, session);
    }

    return session;
  }

  /**
   * Delete session on logout
   */
  deleteSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      console.log(`🚪 User ${session.email} logged out`);
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Cleanup expired sessions (runs every 5 minutes)
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveFor = now - session.lastActivity;
      const exceededMaxLifetime = now > session.expiresAt;

      if (exceededMaxLifetime || inactiveFor > this.INACTIVITY_TIMEOUT_MS) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
    }
  }
}
```

### Step 2: Update JWT Strategy

**File:** `backend/src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserSessionService } from '../services/user-session.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private userSessionService: UserSessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: true, // IMPORTANT: Get request object
    });
  }

  async validate(req: Request, payload: any) {
    // CRITICAL: Check if this is a heartbeat request
    const isHeartbeat = req.headers['x-heartbeat'] === 'true';
    
    // Validate JWT payload has sessionId
    if (!payload.sessionId) {
      throw new UnauthorizedException('Invalid token: missing session ID');
    }

    // Validate and refresh the session
    // Pass isHeartbeat flag to prevent heartbeat from keeping session alive
    const session = this.userSessionService.validateAndRefreshSession(
      payload.sessionId,
      isHeartbeat
    );

    // Get user details
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user with session info
    return {
      ...user,
      sessionId: payload.sessionId,
      authMethod: session.authMethod,
    };
  }
}
```

### Step 3: Update Auth Service (Login)

**File:** `backend/src/auth/auth.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSessionService } from './services/user-session.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userSessionService: UserSessionService,
    // ... other dependencies
  ) {}

  async login(loginDto: LoginDto) {
    // Validate credentials
    const user = await this.validateCredentials(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // IMPORTANT: Create session
    const sessionId = this.userSessionService.createSession(
      user.id,
      user.email,
      user.role,
      user.clinicId,
      'email',
    );

    // IMPORTANT: Include sessionId in JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      sessionId, // ← CRITICAL
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        clinicName: user.clinic?.name,
      },
    };
  }
}
```

### Step 4: Update Auth Controller

**File:** `backend/src/auth/auth.controller.ts`

```typescript
import { Controller, Get, Post, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserSessionService } from './services/user-session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userSessionService: UserSessionService,
  ) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any) {
    // Delete the session
    if (user.sessionId) {
      this.userSessionService.deleteSession(user.sessionId);
    }
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    // IMPORTANT: Prevent caching to ensure session validation happens
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return user;
  }
}
```

### Step 5: Register in Auth Module

**File:** `backend/src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserSessionService } from './services/user-session.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserSessionService, // ← Add this
  ],
  exports: [AuthService, UserSessionService],
})
export class AuthModule {}
```

---

## Frontend Implementation

### Step 1: Update API Client

**File:** `frontend/src/lib/api-client.ts`

```typescript
// Custom event for session expiry
export const SESSION_EXPIRED_EVENT = 'session-expired';

export const dispatchSessionExpired = (message: string) => {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(isHeartbeat = false): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      // IMPORTANT: Prevent caching
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // IMPORTANT: Mark heartbeat requests
      ...(isHeartbeat ? { 'X-Heartbeat': 'true' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle redirects as session expiry
    if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
      const message = 'Your session has expired';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatchSessionExpired(message);
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      throw new Error(message);
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Get error message from backend
        const errorData = await response.json().catch(() => ({ 
          message: 'Your session has expired' 
        }));
        const message = errorData.message || 'Your session has expired';
        
        // Clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch event
        dispatchSessionExpired(message);
        
        // Delay redirect to allow toast to show
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
        
        throw new Error(message);
      }

      const error = await response.json().catch(() => ({ 
        message: response.statusText 
      }));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: { isHeartbeat?: boolean }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(options?.isHeartbeat),
      redirect: 'manual', // IMPORTANT: Don't follow redirects
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      redirect: 'manual',
    });
    return this.handleResponse<T>(response);
  }

  // ... similar for put, delete
}

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:3344/v1'
);
```

### Step 2: Update Auth Service

**File:** `frontend/src/services/auth.service.ts`

```typescript
import { apiClient } from '../lib/api-client';
import type { LoginRequest, LoginResponse, User } from '../types/api';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Regular getMe - refreshes session (used for real user actions)
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  // IMPORTANT: Heartbeat version - does NOT refresh session
  getMeHeartbeat: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me', { isHeartbeat: true });
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
```

### Step 3: Add Heartbeat to Auth Context

**File:** `frontend/src/components/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services';
import { SESSION_EXPIRED_EVENT } from '../lib/api-client';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string;
  clinicName: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for session expiry events
  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      const message = event.detail?.message || 'Your session has expired';
      
      toast.warning(message, {
        duration: 5000,
        description: 'Please sign in again to continue',
      });
      
      setUser(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired as EventListener);
    };
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (error) {
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // CRITICAL: Session heartbeat mechanism
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Starting session heartbeat');

    // For production (20 min timeout): check every 60 seconds
    // For testing (30 sec timeout): check every 10 seconds
    const heartbeatInterval = setInterval(async () => {
      try {
        // IMPORTANT: Use getMeHeartbeat to NOT refresh the session
        await authApi.getMeHeartbeat();
      } catch (error) {
        // Session expired - event listener will handle toast and redirect
        console.log('Session heartbeat: validation failed');
      }
    }, 60000); // 60 seconds for production

    return () => {
      console.log('🛑 Stopping session heartbeat');
      clearInterval(heartbeatInterval);
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## Testing

### Configuration for Testing

**Backend:**
```typescript
// user-session.service.ts
private readonly INACTIVITY_TIMEOUT_MS = 0.5 * 60 * 1000; // 30 seconds
```

**Frontend:**
```typescript
// AuthContext.tsx
setInterval(async () => { ... }, 10000); // 10 seconds
```

### Test Procedure

1. **Start services:**
   ```bash
   # Terminal 1
   cd backend && npm run start:dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Login and open console (F12)**

3. **Observe logs:**
   - Backend: `✅ Created session xxx`
   - Frontend: `🔄 Starting session heartbeat`
   - Every 10s: `💓 Heartbeat check`

4. **Wait 30+ seconds without clicking anything**

5. **Expected result:**
   - Backend: `⏰ Session xxx expired (31s inactive)`
   - Frontend: `❌ Heartbeat: Session validation failed`
   - Toast appears: "Session expired due to inactivity"
   - Auto-redirect to login

### Verify Heartbeat Doesn't Keep Alive

**Check backend logs:**
```
💓 Heartbeat check for session xxx - not updating activity  ← GOOD
```

**If you see this, heartbeat is BROKEN:**
```
🔄 Session xxx activity updated (from heartbeat)  ← BAD
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Change timeout to 20 minutes:
  ```typescript
  private readonly INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;
  ```

- [ ] Change heartbeat to 60 seconds:
  ```typescript
  setInterval(async () => { ... }, 60000);
  ```

- [ ] Replace in-memory sessions with Redis

- [ ] Remove verbose console.log statements

- [ ] Test in staging environment

- [ ] Monitor session metrics

### Redis Implementation

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
```

```typescript
// user-session.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserSessionService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
  async createSession(userId: string, email: string, ...): Promise<string> {
    const sessionId = this.generateSecureToken();
    const session = { userId, email, ... };
    
    await this.cacheManager.set(
      `session:${sessionId}`,
      session,
      this.INACTIVITY_TIMEOUT_MS
    );
    
    return sessionId;
  }
  
  async validateAndRefreshSession(sessionId: string, isHeartbeat = false): Promise<UserSession> {
    const session = await this.cacheManager.get(`session:${sessionId}`);
    
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    
    // Validation logic...
    
    if (!isHeartbeat) {
      // Refresh TTL in Redis
      await this.cacheManager.set(
        `session:${sessionId}`,
        session,
        this.INACTIVITY_TIMEOUT_MS
      );
    }
    
    return session;
  }
}
```

---

## Common Pitfalls

### ❌ Heartbeat Keeps Session Alive

**Symptom:** Session never expires even after hours of inactivity

**Cause:** `isHeartbeat` flag not working

**Fix:**
1. Check `X-Heartbeat: true` header is sent
2. Check JWT strategy reads header: `req.headers['x-heartbeat']`
3. Check session service receives flag: `validateAndRefreshSession(id, isHeartbeat)`
4. Verify backend logs show: "💓 Heartbeat check - not updating activity"

### ❌ Getting 304 Not Modified

**Symptom:** Heartbeat doesn't trigger session validation

**Cause:** Browser caching responses

**Fix:**
1. Add cache-control headers to requests
2. Add cache-control headers to responses
3. Use `redirect: 'manual'` in fetch

### ❌ Toast Doesn't Show

**Symptom:** Redirect happens but no notification

**Cause:** Event listener not registered or toast delay too short

**Fix:**
1. Verify `SESSION_EXPIRED_EVENT` listener in AuthContext
2. Add 500ms delay before redirect
3. Check Sonner Toaster is rendered in App.tsx

### ❌ No Auto-Logout

**Symptom:** User stays logged in after timeout

**Cause:** No heartbeat mechanism

**Fix:**
1. Add heartbeat useEffect in AuthContext
2. Call `getMeHeartbeat()` every 60 seconds
3. Verify heartbeat runs (check console logs)

---

## Summary

This implementation provides:

✅ **Automatic session timeout** after configurable inactivity period  
✅ **Proactive detection** via heartbeat mechanism  
✅ **User-friendly notifications** with toast messages  
✅ **Session keep-alive** on real user activity  
✅ **No cache issues** with proper headers  
✅ **Production-ready** architecture (with Redis migration path)  

**Key Innovation:** The `isHeartbeat` flag distinguishes automated health checks from real user activity, allowing proactive session validation without keeping sessions alive indefinitely.

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Author:** CheckUp Development Team
