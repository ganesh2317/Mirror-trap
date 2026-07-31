export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  durationMs?: number;
}

class Logger {
  private logs: LogEvent[] = [];
  private maxLogs = 500;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, durationMs?: number) {
    const entry: LogEvent = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      durationMs,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (process.env.NODE_ENV !== 'production' || level === 'error') {
      const prefix = `[MirrorTrap:${level.toUpperCase()}]`;
      if (level === 'error') console.error(prefix, message, context ?? '');
      else if (level === 'warn') console.warn(prefix, message, context ?? '');
      else console.log(prefix, message, context ?? '');
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  time(label: string): () => number {
    const start = performance.now();
    return () => {
      const durationMs = +(performance.now() - start).toFixed(2);
      this.log('info', `Performance mark: ${label}`, { durationMs }, durationMs);
      return durationMs;
    };
  }

  getLogs(): LogEvent[] {
    return [...this.logs];
  }

  checkHealth(): { status: 'OK' | 'DEGRADED'; uptimeSeconds: number; logCount: number } {
    return {
      status: 'OK',
      uptimeSeconds: Math.floor(performance.now() / 1000),
      logCount: this.logs.length,
    };
  }
}

export const logger = new Logger();
