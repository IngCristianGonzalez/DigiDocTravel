import * as winston from 'winston';

// OWASP A09 - Logging and Monitoring Failures: Centralized structured logging
export const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'digidoc-travel' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // In production, add file transports:
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export function logSecurityEvent(event: string, meta: any = {}) {
  winstonLogger.warn(`[SECURITY] ${event}`, { ...meta, timestamp: new Date().toISOString() });
}

export function logAudit(action: string, userId: string, meta: any = {}) {
  winstonLogger.info(`[AUDIT] ${action}`, { userId, ...meta });
}
