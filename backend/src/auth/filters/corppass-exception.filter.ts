import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Custom exception filter for CorpPass authentication errors
 * Intercepts UnauthorizedException and redirects to frontend error page
 * instead of returning JSON response
 */
@Catch(UnauthorizedException)
export class CorpPassExceptionFilter implements ExceptionFilter {
  constructor(private configService: ConfigService) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Only handle CorpPass callback errors
    if (!request.url.includes('/auth/corppass/callback')) {
      // For other endpoints, use default behavior
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    // Get the error message
    const exceptionResponse = exception.getResponse();
    let errorMessage = 'Authentication failed. Please contact your administrator.';
    
    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const msg = (exceptionResponse as any).message;
      errorMessage = typeof msg === 'string' ? msg : (Array.isArray(msg) ? msg[0] : errorMessage);
    }

    // Build frontend error URL
    const frontendUrl = this.configService.get<string>('CORPPASS_FRONTEND_CALLBACK_URL')?.split('/auth/corppass')[0] || 'http://localhost:6688';
    const errorUrl = new URL('/auth/error', frontendUrl);
    errorUrl.searchParams.set('message', errorMessage);

    console.log(`CorpPass authentication error: ${errorMessage}`);
    console.log(`Redirecting to: ${errorUrl.toString()}`);

    // Redirect to error page
    response.redirect(errorUrl.toString());
  }
}
