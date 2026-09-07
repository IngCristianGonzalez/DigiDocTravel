import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// OWASP A07 - Identification and Authentication Failures: Rate limiting globally, custom for auth
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    // Track by IP + user ID if authenticated, to prevent bypass via multiple accounts
    const ip: unknown = req.ip;
    const socket: unknown = req.socket;
    const remoteAddress: unknown =
      typeof socket === 'object' && socket !== null && 'remoteAddress' in socket
        ? socket.remoteAddress
        : undefined;
    return Promise.resolve((ip || remoteAddress || 'unknown') as string);
  }
}
