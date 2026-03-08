import pino from 'pino';
import type { AppLogger } from './AppLogger';
import { PinoLoggerAdapter } from './PinoLoggerAdapter';
import type { LoggerDecorator } from './PinoLoggerDecorators';

export class LoggerFactory {
  private rootLogger: AppLogger | undefined;

  constructor(private readonly decorator: LoggerDecorator) {}

  getLogger(scope: string): AppLogger {
    return this.getRootLogger().child({ scope });
  }

  private getRootLogger(): AppLogger {
    if (!this.rootLogger) {
      this.rootLogger = this.createRootLogger();
    }

    return this.rootLogger;
  }

  private createRootLogger(): AppLogger {
    const { options, transport } = this.decorator.decorate({
      level: process.env.LOG_LEVEL ?? 'info',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    });

    return transport
      ? new PinoLoggerAdapter(pino(options, transport))
      : new PinoLoggerAdapter(pino(options));
  }
}
