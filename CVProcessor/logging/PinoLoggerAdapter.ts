import type { Logger as PinoLogger } from 'pino';
import type { AppLogger, LoggerMetadata } from './AppLogger';

export class PinoLoggerAdapter implements AppLogger {
  constructor(private readonly logger: PinoLogger) {}

  debug(message: string, metadata?: LoggerMetadata): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: LoggerMetadata): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LoggerMetadata): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LoggerMetadata): void {
    this.log('error', message, metadata);
  }

  child(bindings: LoggerMetadata): AppLogger {
    return new PinoLoggerAdapter(this.logger.child(bindings));
  }

  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    metadata?: LoggerMetadata,
  ): void {
    if (metadata) {
      this.logger[level](metadata, message);
      return;
    }

    this.logger[level](message);
  }
}
