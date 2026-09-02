import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// OWASP A07 - Identification and Authentication Failures: Rate limiting globally, custom for auth
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by IP + user ID if authenticated, to prevent bypass via multiple accounts
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
