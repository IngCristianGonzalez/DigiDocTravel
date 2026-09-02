import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip, headers } = request;
    const device = headers['user-agent'] || '';

    return next.handle().pipe(
      tap(async () => {
        if (user) {
          await this.auditService.log({
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
