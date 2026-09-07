import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service.js';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const ip = request.ip;
    const headers = request.headers;
    const userAgent = headers['user-agent'];
    const device = typeof userAgent === 'string' ? userAgent : '';

    return next.handle().pipe(
      tap(() => {
        if (user) {
          void this.auditService.log({
            userId: user.id,
            action: method,
            module: url.split('/')[1] || 'auth',
            ip: ip || '',
            device,
          });
        }
      }),
    );
  }
}
