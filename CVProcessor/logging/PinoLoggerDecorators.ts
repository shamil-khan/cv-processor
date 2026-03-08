import pino, {
  type DestinationStream,
  type LoggerOptions,
  type TransportTargetOptions,
} from 'pino';

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
    process.env.LOG_PRETTY === 'true'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : null;

  private resolveLogFileTransport = (): TransportTargetOptions => ({
    target: 'pino/file',
    level: process.env.LOG_LEVEL ?? 'info',
    options: {
      // Example: ./logs/app-2023-02-25.log
      destination: `./.logs/app-${new Date().toISOString().split('T')[0]}.log`,
      mkdir: true,
    },
  });
}
