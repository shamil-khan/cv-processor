import pino, { type LoggerOptions } from "pino";
import type { AppLogger } from "./AppLogger";
import { PinoLoggerAdapter } from "./PinoLoggerAdapter";

export class LoggerFactory {
  private static rootLogger: AppLogger | undefined;

  static getLogger(scope: string): AppLogger {
    return this.getRootLogger().child({ scope });
  }

  private static getRootLogger(): AppLogger {
    if (!this.rootLogger) {
      this.rootLogger = this.createRootLogger();
    }

    return this.rootLogger;
  }

  private static createRootLogger(): AppLogger {
    const shouldUsePrettyOutput = this.resolvePrettyOutputSetting();
    const loggerOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL ?? "info",
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    if (shouldUsePrettyOutput) {
      loggerOptions.transport = {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
        },
      };
    }

    return new PinoLoggerAdapter(pino(loggerOptions));
  }

  private static resolvePrettyOutputSetting(): boolean {
    if (process.env.LOG_PRETTY === "true") {
      return true;
    }

    if (process.env.LOG_PRETTY === "false") {
      return false;
    }

    return process.env.NODE_ENV !== "production";
  }
}
