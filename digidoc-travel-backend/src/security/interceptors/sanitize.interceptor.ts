import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

// OWASP A03 - Injection: XSS sanitization for all incoming string fields
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // xss lib sanitizes <script> etc, also strip SQL patterns
    let clean = xss.filterXSS(value);
    // Additional SQL injection patterns removal (basic)
    clean = clean.replace(/('|--|;|\/\*|\*\/|xp_)/gi, '');
    return clean.trim();
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(source)) out[k] = sanitizeValue(source[k]);
    return out;
  }
  return value;
}

interface SanitizableRequest {
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<SanitizableRequest>();
    if (request.body) request.body = sanitizeValue(request.body);
    // Express 5: request.query is getter-only, mutate in place
    if (request.query) {
      const sanitizedQuery = sanitizeValue(request.query);
      for (const key of Object.keys(request.query)) delete request.query[key];
      Object.assign(request.query, sanitizedQuery);
    }
    if (request.params) {
      const sanitizedParams = sanitizeValue(request.params);
      for (const key of Object.keys(request.params)) delete request.params[key];
      Object.assign(request.params, sanitizedParams);
    }
    return next.handle();
  }
}
