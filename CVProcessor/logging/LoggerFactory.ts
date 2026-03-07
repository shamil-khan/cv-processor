import pino, { type LoggerOptions, type TransportTargetOptions } from 'pino';
import type { AppLogger } from './AppLogger';
import { PinoLoggerAdapter } from './PinoLoggerAdapter';

export class LoggerFactory {
  private static rootLogger: AppLogger | undefined;

  static getLogger(scope: string): AppLogger {
    return this.getRootLogger().child({ scope });
  }

  private static getRootLogger(): AppLogger {
    if (!this.rootLogger) {
      this.rootLogger =
        process.env.NODE_ENV === 'production'
          ? this.createRootLoggerProduction()
          : this.createRootLogger();
    }

    return this.rootLogger;
  }

  private static createRootLogger(): AppLogger {
    const loggerOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL ?? 'info',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    const targets: TransportTargetOptions[] = [this.resolveLogFileTransport()];

    if (this.resolvePrettyOutputSetting()) {
      targets.push({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      });
    }

    const transport = pino.transport({ targets });

    return new PinoLoggerAdapter(pino(loggerOptions, transport));
  }

  private static createRootLoggerProduction(): AppLogger {
    // Use 'browser' config which works in hosting providers like Cloudflare's V8 isolation
    const loggerOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL ?? 'info',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      browser: {
        asObject: true, // Logs as JSON objects for hosting providers like Cloudflare to parse
        write: (o) => {
          console.log(JSON.stringify(o));
        },
      },
    };

    // Skip transport/log-file and transport/pino-pretty in hosting providers like Cloudflare production
    return new PinoLoggerAdapter(pino(loggerOptions));
  }

  private static resolvePrettyOutputSetting(): boolean {
    if (process.env.LOG_PRETTY === 'true') {
      return true;
    }

    if (process.env.LOG_PRETTY === 'false') {
      return false;
    }

    return process.env.NODE_ENV !== 'production';
  }

  private static resolveLogFileTransport(): TransportTargetOptions {
    // Generate timestamp string: YYYY-MM-DD
    const timestamp = new Date().toISOString().split('T')[0]; // Remove time

    // Generate timestamp string: YYYY-MM-DD-HH-mm-ss
    // const timestamp = new Date()
    //   .toISOString()
    //   .replace(/[:T]/g, "-") // Replace colons and T with dashes for filename safety
    //   .split(".")[0]; // Remove milliseconds

    return {
      target: 'pino/file',
      level: process.env.LOG_LEVEL ?? 'info',
      options: {
        // Example: ./logs/app-2023-10-27-14-30-05.log
        destination: `./.logs/app-${timestamp}.log`,
        mkdir: true,
      },
    };
  }
}
