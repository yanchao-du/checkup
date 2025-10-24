import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('.well-known')
export class WellKnownController {
  /**
   * JWKS endpoint for MockPass to verify our client assertions
   * This serves our public key for JWT signature verification
   */
  @Get('jwks.json')
  getJwks() {
    try {
      const jwksPath = path.join(
        process.cwd(),
        'static/certs/corppass-client-public.json',
      );
      const jwksContent = fs.readFileSync(jwksPath, 'utf-8');
      return JSON.parse(jwksContent);
    } catch (error) {
      return {
        error: 'JWKS not found',
        message: error.message,
      };
    }
  }
}
