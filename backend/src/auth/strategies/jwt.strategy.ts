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
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: Request, payload: any) {
    console.log('🔐 JWT Strategy: Validating token with sessionId:', payload.sessionId);
    
    // Check if this is a heartbeat request
    const isHeartbeat = req.headers['x-heartbeat'] === 'true';
    if (isHeartbeat) {
      console.log('💓 JWT Strategy: Heartbeat request detected');
    }
    
    // Validate JWT payload has sessionId
    if (!payload.sessionId) {
      console.log('❌ JWT Strategy: Missing sessionId in token');
      throw new UnauthorizedException('Invalid token: missing session ID');
    }

    // Validate and refresh the session (throws if expired)
    // Pass isHeartbeat flag - heartbeat checks won't update lastActivity
    try {
      const session = this.userSessionService.validateAndRefreshSession(payload.sessionId, isHeartbeat);
      console.log('✅ JWT Strategy: Session validated and refreshed');
      
      // Get user details
      const user = await this.authService.validateUser(payload.sub);
      
      if (!user) {
        console.log('❌ JWT Strategy: User not found');
        throw new UnauthorizedException('User not found');
      }

      console.log('✅ JWT Strategy: User validated:', user.email);
      
      // Return user with session info
      return {
        ...user,
        sessionId: payload.sessionId,
        authMethod: session.authMethod,
      };
    } catch (error) {
      console.log('❌ JWT Strategy: Session validation failed:', error.message);
      throw error;
    }
  }
}
