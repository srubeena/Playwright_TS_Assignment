import winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Persistent log file — appended across runs
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution.log'),
      level: 'info',
    }),
    // Separate file for errors only — easier to scan failures quickly
    new winston.transports.File({
      filename: path.join(logsDir, 'test-errors.log'),
      level: 'error',
    }),
    // Console output during test runs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

/**
 * Convenience wrapper to log the start of a test step/action.
 */
export function logStep(step: string): void {
  logger.info(`STEP: ${step}`);
}

/**
 * Convenience wrapper to log a caught exception with full context.
 */
export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error(`FAILED: ${context} — ${message}`, { stack });
}