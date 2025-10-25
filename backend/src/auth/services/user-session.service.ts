import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserSession {
  userId: string;  // Changed from number to string (UUID)
  email: string;
  role: string;
  clinicId: string | null;  // Changed from number to string (UUID)
  authMethod: 'email' | 'corppass';
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

/**
 * User session management service
 * 
 * PRODUCTION DEPLOYMENT:
 * - Replace in-memory storage with Redis for horizontal scaling
 * - Use Redis with persistence (AOF + RDS) for session durability
 * - Configure Redis cluster for high availability
 * - Enable Redis authentication and TLS encryption
 * 
 * SECURITY FEATURES:
 * - 20-minute inactivity timeout (configurable)
 * - Automatic session cleanup
 * - Session keep-alive on activity
 * - Explicit logout session deletion
 * - Maximum session lifetime (24 hours)
 * 
 * IMPLEMENTATION FOR REDIS:
 * ```typescript
 * import { Injectable, Inject } from '@nestjs/common';
 * import { CACHE_MANAGER } from '@nestjs/cache-manager';
 * import { Cache } from 'cache-manager';
 * 
 * @Injectable()
 * export class UserSessionService {
 *   constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
 *   
 *   async createSession(sessionId: string, data: UserSession): Promise<void> {
 *     await this.cacheManager.set(
 *       `session:${sessionId}`,
 *       data,
 *       this.INACTIVITY_TIMEOUT_MS
 *     );
 *   }
 *   
 *   async getSession(sessionId: string): Promise<UserSession | null> {
 *     return await this.cacheManager.get(`session:${sessionId}`);
 *   }
 * }
 * ```
 */
@Injectable()
export class UserSessionService {
  private sessions = new Map<string, UserSession>();
  
  // 20 minutes of inactivity
  private readonly INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;
  
  // Maximum session lifetime: 24 hours
  private readonly MAX_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

  constructor(private configService: ConfigService) {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Create a new user session after successful authentication
   * @param userId - User ID (UUID string)
   * @param email - User email
   * @param role - User role
   * @param clinicId - Clinic ID (UUID string, optional)
   * @param authMethod - Authentication method used
   * @returns sessionId to be used in JWT
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
    console.log(`✅ Created session ${sessionId} for user ${email} via ${authMethod}`);

    return sessionId;
  }

  /**
   * Validate session and update last activity (keep-alive)
   * @param sessionId - Session ID from JWT
   * @param isHeartbeat - If true, don't update lastActivity (just check validity)
   * @returns User session data if valid
   * @throws UnauthorizedException if session is expired or invalid
   */
  validateAndRefreshSession(sessionId: string, isHeartbeat = false): UserSession {
    const session = this.sessions.get(sessionId);

    if (!session) {
      // Session not found - user needs to log in again
      throw new UnauthorizedException('Session not found. Please sign in again.');
    }

    const now = Date.now();

    // Check if session has exceeded maximum lifetime
    if (now > session.expiresAt) {
      this.sessions.delete(sessionId);
      console.log(`⏰ Session ${sessionId} expired (max lifetime exceeded)`);
      throw new UnauthorizedException('Session expired (maximum lifetime reached). Please sign in again.');
    }

    // Check inactivity timeout
    const inactiveFor = now - session.lastActivity;
    if (inactiveFor > this.INACTIVITY_TIMEOUT_MS) {
      this.sessions.delete(sessionId);
      const inactiveSeconds = Math.round(inactiveFor / 1000);
      console.log(`⏰ Session ${sessionId} expired (${inactiveSeconds}s inactive, threshold: ${this.INACTIVITY_TIMEOUT_MS / 1000}s)`);
      throw new UnauthorizedException('Session expired due to inactivity. Please sign in again.');
    }

    // Update last activity ONLY if this is NOT a heartbeat check
    // Heartbeat checks should not keep the session alive
    if (!isHeartbeat) {
      session.lastActivity = now;
      this.sessions.set(sessionId, session);
      console.log(`🔄 Session ${sessionId} activity updated (${session.email})`);
    } else {
      console.log(`💓 Heartbeat check for session ${sessionId} - not updating activity`);
    }

    return session;
  }

  /**
   * Delete session on logout
   * @param sessionId - Session ID to delete
   */
  deleteSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      console.log(`🚪 User ${session.email} logged out (session ${sessionId})`);
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Delete all sessions for a specific user (e.g., password change, security breach)
   * @param userId - User ID (UUID string)
   */
  deleteAllUserSessions(userId: string): number {
    let deleted = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        deleted++;
      }
    }
    if (deleted > 0) {
      console.log(`🔒 Deleted ${deleted} sessions for user ID ${userId}`);
    }
    return deleted;
  }

  /**
   * Get active sessions for a user (for security audit)
   * @param userId - User ID (UUID string)
   */
  getUserSessions(userId: string): Array<{
    sessionId: string;
    createdAt: Date;
    lastActivity: Date;
    authMethod: string;
  }> {
    const userSessions: Array<any> = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        userSessions.push({
          sessionId,
          createdAt: new Date(session.createdAt),
          lastActivity: new Date(session.lastActivity),
          authMethod: session.authMethod,
        });
      }
    }

    return userSessions;
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Cleanup expired sessions
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
      console.log(`🧹 Cleaned up ${cleaned} expired user sessions`);
    }
  }

  /**
   * Get session statistics (for monitoring)
   */
  getStats(): {
    total: number;
    byAuthMethod: { email: number; corppass: number };
    expired: number;
  } {
    const now = Date.now();
    const stats = {
      total: this.sessions.size,
      byAuthMethod: { email: 0, corppass: 0 },
      expired: 0,
    };

    for (const session of this.sessions.values()) {
      stats.byAuthMethod[session.authMethod]++;
      
      const inactiveFor = now - session.lastActivity;
      if (inactiveFor > this.INACTIVITY_TIMEOUT_MS || now > session.expiresAt) {
        stats.expired++;
      }
    }

    return stats;
  }
}
