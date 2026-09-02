import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { winstonLogger, logSecurityEvent } from '../../security/logger/winston.logger.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      stack = exception.stack;
      // OWASP A05 - Do not leak stack traces to client in production
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
    }

    // OWASP A09 - Structured logging with sanitized output
    const logMeta = {
      method: request.method,
      url: request.url,
      status,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.id,
    };

    if (status >= 500) {
      winstonLogger.error(`${request.method} ${request.url} ${status}`, { ...logMeta, stack, message });
    } else if (status === 401 || status === 403) {
      logSecurityEvent(`HTTP_${status}`, logMeta);
      winstonLogger.warn(`Auth failure ${status}`, logMeta);
    } else {
      winstonLogger.warn(`${request.method} ${request.url} ${status}`, { ...logMeta, message });
    }

    // OWASP A05 - Generic error for 500, hide internals
    const clientMessage = status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: clientMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Only include requestId in prod for tracing, not stack
    });
  }
}
