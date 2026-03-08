import type { LoggerDecorator } from './PinoLoggerDecorators';
import { NodeDecorator, TestDecorator, WebDecorator } from './PinoLoggerDecorators';
import type { LoggingEnvironment } from './LoggingEnvironment';

export class LoggerDecoratorResolver {
  constructor(private readonly environment: LoggingEnvironment) {}

  resolve(): LoggerDecorator {
    if (this.environment.isTest()) {
      return new TestDecorator();
    }

    if (this.environment.isBrowserRuntime()) {
      return new WebDecorator();
    }

    if (this.environment.isBackendRuntime()) {
      return new NodeDecorator(this.environment);
    }

    if (this.environment.isProduction()) {
      return new WebDecorator();
    }

    return this.environment.isNodeRuntime()
      ? new NodeDecorator(this.environment)
      : new WebDecorator();
  }
}
