import { Controller, Post, Body, Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CorpPassLoginDto } from './dto/corppass.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './services/session.service';
import { UserSessionService } from './services/user-session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private sessionService: SessionService,
    private userSessionService: UserSessionService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

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
    // Prevent caching of this endpoint to ensure session validation happens
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return user;
  }

  /**
   * Initiate CorpPass OAuth flow
   * Redirects user to CorpPass login page
   */
  @Get('corppass/authorize')
  async corppassAuthorize(@Res() res: Response) {
    const authorizeUrl = this.configService.get<string>('CORPPASS_AUTHORIZE_URL');
    const clientId = this.configService.get<string>('CORPPASS_CLIENT_ID');
    const callbackUrl = this.configService.get<string>('CORPPASS_CALLBACK_URL');

    if (!authorizeUrl || !clientId || !callbackUrl) {
      throw new Error('CorpPass configuration missing');
    }

    // Create OAuth session with secure state and nonce
    const { sessionId, state, nonce } = this.sessionService.createOAuthSession();

    // Build authorization URL
    const authUrl = new URL(authorizeUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);

    // Store session ID in secure cookie
    res.cookie('corppass_oauth_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600000, // 10 minutes
    });

    // Redirect to CorpPass
    return res.redirect(authUrl.toString());
  }

  /**
   * Handle CorpPass OAuth callback
   * This endpoint receives the authorization code from CorpPass
   */
  @Get('corppass/callback')
  @UseGuards(AuthGuard('corppass'))
  async corppassCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Verify state to prevent CSRF attacks
    const stateFromQuery = req.query.state as string;
    const sessionId = (req as any).cookies?.corppass_oauth_session;

    if (!sessionId || !stateFromQuery) {
      return res.status(403).send({ error: 'Missing session or state parameter' });
    }

    // Verify OAuth session and get nonce
    const nonce = this.sessionService.verifyOAuthSession(sessionId, stateFromQuery);
    
    if (!nonce) {
      return res.status(403).send({ error: 'Invalid or expired OAuth session' });
    }

    // Delete the OAuth session (one-time use)
    this.sessionService.deleteOAuthSession(sessionId);
    
    // Clear the OAuth session cookie
    res.clearCookie('corppass_oauth_session');

    // User is attached by CorpPassStrategy after successful validation
    const user = req.user as any;

    // Create user session for CorpPass authentication
    const userSessionId = this.userSessionService.createSession(
      user.id,
      user.email,
      user.role,
      user.clinicId,
      'corppass',
    );

    // Generate CheckUp JWT token with session ID
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      sessionId: userSessionId,  // Include session ID
    };

    const token = this.authService['jwtService'].sign(payload);

    // Redirect to frontend with token
    const frontendCallbackUrl = this.configService.get<string>('CORPPASS_FRONTEND_CALLBACK_URL');
    
    if (!frontendCallbackUrl) {
      throw new Error('CORPPASS_FRONTEND_CALLBACK_URL not configured');
    }

    const redirectUrl = new URL(frontendCallbackUrl);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify(user));

    return res.redirect(redirectUrl.toString());
  }

  /**
   * Alternative CorpPass login endpoint (POST)
   * For frontend to exchange authorization code for token
   */
  @Post('corppass/login')
  async corppassLogin(
    @Body() corpPassLoginDto: CorpPassLoginDto,
  ) {
    // This endpoint can be used if frontend wants to handle the token exchange
    // For now, we'll use the callback approach above
    return {
      message: 'Use GET /auth/corppass/callback for OAuth flow',
    };
  }
}
