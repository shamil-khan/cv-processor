export const LOGGING_ENV_KEYS = {
  nodeEnv: 'NODE_ENV',
  logLevel: 'LOG_LEVEL',
  logPretty: 'LOG_PRETTY',
} as const;

export const LOGGING_DEFAULTS = {
  nodeEnv: 'development',
  logLevel: 'info',
  logPretty: 'true',
} as const;

export type LoggingEnvKey = keyof typeof LOGGING_ENV_KEYS;

export interface LoggingEnvironment {
  get(key: LoggingEnvKey): string | undefined;
  getOrDefault(key: LoggingEnvKey): string;
  isNodeRuntime(): boolean;
  isBrowserRuntime(): boolean;
  isCloudflareRuntime(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
  isBackendRuntime(): boolean;
}

export class GlobalLoggingEnvironment implements LoggingEnvironment {
  get(key: LoggingEnvKey): string | undefined {
    const envKey = LOGGING_ENV_KEYS[key];
    const processLike = this.getProcessLike();
    const value = processLike?.env?.[envKey];
    return typeof value === 'string' ? value : undefined;
  }

  getOrDefault(key: LoggingEnvKey): string {
    return this.get(key) ?? LOGGING_DEFAULTS[key];
  }

  isNodeRuntime(): boolean {
    const processLike = this.getProcessLike();
    return typeof processLike?.versions?.node === 'string';
  }

  isBrowserRuntime(): boolean {
    const globalObject = globalThis as {
      window?: unknown;
      document?: unknown;
    };

    return (
      typeof globalObject.window === 'object' && typeof globalObject.document === 'object'
    );
  }

  isCloudflareRuntime(): boolean {
    const globalObject = globalThis as { WebSocketPair?: unknown };
    return !this.isNodeRuntime() && typeof globalObject.WebSocketPair === 'function';
  }

  isProduction(): boolean {
    return this.getOrDefault('nodeEnv') === 'production' || this.isCloudflareRuntime();
  }

  isTest(): boolean {
    return this.getOrDefault('nodeEnv') === 'test';
  }

  isBackendRuntime(): boolean {
    return this.isNodeRuntime() && !this.isBrowserRuntime();
  }

  private getProcessLike(): {
    env?: Record<string, string | undefined>;
    versions?: { node?: string };
  } | null {
    const processCandidate = (globalThis as { process?: unknown }).process;
    if (!processCandidate || typeof processCandidate !== 'object') {
      return null;
    }

    return processCandidate as {
      env?: Record<string, string | undefined>;
      versions?: { node?: string };
    };
  }
}
