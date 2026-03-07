import type { AppLogger, LoggerMetadata } from '@/CVProcessor/logging';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: LoggerMetadata;
}

export class InMemoryLogger implements AppLogger {
  constructor(
    private readonly buffer: LogEntry[] = [],
    private readonly bindings: LoggerMetadata = {},
  ) {}

  get entries(): readonly LogEntry[] {
    return this.buffer;
  }

  debug(message: string, metadata?: LoggerMetadata): void {
    this.push('debug', message, metadata);
  }

  info(message: string, metadata?: LoggerMetadata): void {
    this.push('info', message, metadata);
  }

  warn(message: string, metadata?: LoggerMetadata): void {
    this.push('warn', message, metadata);
  }

  error(message: string, metadata?: LoggerMetadata): void {
    this.push('error', message, metadata);
  }

  child(bindings: LoggerMetadata): AppLogger {
    return new InMemoryLogger(this.buffer, {
      ...this.bindings,
      ...bindings,
    });
  }

  private push(level: LogLevel, message: string, metadata?: LoggerMetadata): void {
    const mergedMetadata: LoggerMetadata = {
      ...this.bindings,
      ...(metadata ?? {}),
    };

    this.buffer.push({
      level,
      message,
      metadata: Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
    });
  }
}
