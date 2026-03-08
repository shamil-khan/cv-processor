import pino, {
  type DestinationStream,
  type LoggerOptions,
  type TransportTargetOptions,
} from 'pino';
import type { LoggingEnvironment } from './LoggingEnvironment';

export interface LoggerDecorator {
  decorate(options: LoggerOptions): {
    options: LoggerOptions;
    transport: DestinationStream | null;
  };
}

export class TestDecorator implements LoggerDecorator {
  decorate = (options: LoggerOptions) => ({
    options: { ...options, level: 'error' },
    transport: null,
  });
}

export class WebDecorator implements LoggerDecorator {
  decorate = (options: LoggerOptions) => ({
    options: {
      ...options,
      browser: {
        asObject: true,
        write: (o: unknown) => {
          console.log(JSON.stringify(o));
        },
      },
    },
    transport: null,
  });
}

export class NodeDecorator implements LoggerDecorator {
  constructor(private readonly environment: LoggingEnvironment) {}

  decorate = (options: LoggerOptions) => {
    const targets = [
      this.resolvePrettyTransport(),
      this.resolveLogFileTransport(),
    ].filter((t) => t !== null);

    return {
      options: options,
      transport: pino.transport({ targets }),
    };
  };

  private resolvePrettyTransport = (): TransportTargetOptions | null =>
    this.environment.getOrDefault('logPretty') === 'false'
      ? null
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        };

  private resolveLogFileTransport = (): TransportTargetOptions => ({
    target: 'pino/file',
    level: this.environment.getOrDefault('logLevel'),
    options: {
      // Example: ./logs/app-2023-02-25.log
      destination: `./.logs/app-${new Date().toISOString().split('T')[0]}.log`,
      mkdir: true,
    },
  });
}
