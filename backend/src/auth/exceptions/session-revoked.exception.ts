import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown when a user's session is revoked due to another login
 * This is different from session expiration - it means the user logged in elsewhere
 */
export class SessionRevokedException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Your session has been revoked because you logged in from another location.',
      code: 'SESSION_REVOKED',
    });
  }
}
