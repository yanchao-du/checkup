import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SessionData {
  state: string;
  nonce: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Session management service for OAuth flows
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Currently uses in-memory storage (suitable for single-instance dev/staging)
 * - For production with multiple instances, replace with Redis:
 *   1. Install: npm install ioredis @nestjs/cache-manager cache-manager-ioredis-yet
 *   2. Configure Redis client with cluster support
 *   3. Update methods to use Redis GET/SET/DEL operations
 *   4. Enable Redis persistence (AOF + RDS) for durability
 * 
 * SECURITY FEATURES:
 * - Automatic expiry (10 minutes for OAuth state)
 * - Secure random token generation
 * - Cleanup of expired sessions
 * - Session validation before use
 */
@Injectable()
export class SessionService {
  private sessions = new Map<string, SessionData>();
  private readonly SESSION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes for OAuth flows

  constructor(private configService: ConfigService) {
    // Run cleanup every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Create a new OAuth session with state and nonce
   * @returns sessionId to be used as cookie value
   */
  createOAuthSession(): { sessionId: string; state: string; nonce: string } {
    const sessionId = this.generateSecureToken();
    const state = this.generateSecureToken();
    const nonce = this.generateSecureToken();
    
    const now = Date.now();
    const sessionData: SessionData = {
      state,
      nonce,
      createdAt: now,
      expiresAt: now + this.SESSION_EXPIRY_MS,
    };

    this.sessions.set(sessionId, sessionData);

    return { sessionId, state, nonce };
  }

  /**
   * Verify OAuth callback state and get nonce
   * @param sessionId - Session ID from cookie
   * @param state - State parameter from OAuth callback
   * @returns nonce if valid, null otherwise
   */
  verifyOAuthSession(sessionId: string, state: string): string | null {
    const sessionData = this.sessions.get(sessionId);

    if (!sessionData) {
      return null; // Session not found
    }

    if (Date.now() > sessionData.expiresAt) {
      this.sessions.delete(sessionId);
      return null; // Session expired
    }

    if (sessionData.state !== state) {
      return null; // State mismatch (CSRF attack)
    }

    // Return nonce for token validation, session will be deleted after use
    return sessionData.nonce;
  }

  /**
   * Delete OAuth session after successful authentication
   * @param sessionId - Session ID to delete
   */
  deleteOAuthSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Generate cryptographically secure random token
   */
  private generateSecureToken(): string {
    // Use Node.js crypto for secure random generation
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Remove expired sessions from memory
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, data] of this.sessions.entries()) {
      if (now > data.expiresAt) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired OAuth sessions`);
    }
  }

  /**
   * Get session statistics (for monitoring/debugging)
   */
  getStats(): { total: number; expired: number } {
    const now = Date.now();
    let expired = 0;

    for (const data of this.sessions.values()) {
      if (now > data.expiresAt) {
        expired++;
      }
    }

    return {
      total: this.sessions.size,
      expired,
    };
  }
}
