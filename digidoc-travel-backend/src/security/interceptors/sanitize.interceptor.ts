import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

// OWASP A03 - Injection: XSS sanitization for all incoming string fields
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // xss lib sanitizes <script> etc, also strip SQL patterns
    let clean = xss.filterXSS(value);
    // Additional SQL injection patterns removal (basic)
    clean = clean.replace(/('|--|;|\/\*|\*\/|xp_)/gi, '');
    return clean.trim();
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = sanitizeValue(value[k]);
    return out;
  }
  return value;
}

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body) request.body = sanitizeValue(request.body);
    if (request.query) request.query = sanitizeValue(request.query);
    if (request.params) request.params = sanitizeValue(request.params);
    return next.handle();
  }
}
