import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  winstonLogger,
  logSecurityEvent,
} from '../../security/logger/winston.logger.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: unknown;
    [key: string]: unknown;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: unknown = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseMessage: unknown = exceptionResponse.message;
        message = responseMessage || message;
      }
    } else if (exception instanceof Error) {
      stack = exception.stack;
      // OWASP A05 - Do not leak stack traces to client in production
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message;
    }

    // OWASP A09 - Structured logging with sanitized output
    const logMeta = {
      method: request.method,
      url: request.url,
      status,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: request.user?.id,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      winstonLogger.error(`${request.method} ${request.url} ${status}`, {
        ...logMeta,
        stack,
        message,
      });
    } else if (
      status === HttpStatus.UNAUTHORIZED ||
      status === HttpStatus.FORBIDDEN
    ) {
      logSecurityEvent(`HTTP_${status}`, logMeta);
      winstonLogger.warn(`Auth failure ${status}`, logMeta);
    } else {
      winstonLogger.warn(`${request.method} ${request.url} ${status}`, {
        ...logMeta,
        message,
      });
    }

    // OWASP A05 - Generic error for 500, hide internals
    const clientMessage =
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : message;

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
