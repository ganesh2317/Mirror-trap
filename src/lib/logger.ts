/**
 * Logging severity levels for MirrorTrap structured logging subsystem.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structured log entry captured in application memory.
 */
export interface LogEvent {
  /** ISO-8601 timestamp string when the event occurred */
  timestamp: string;
  /** Severity level of the log entry */
  level: LogLevel;
  /** Human-readable event description */
  message: string;
  /** Optional metadata payload providing operational context */
  context?: Record<string, unknown>;
  /** Optional execution duration in milliseconds for timed operations */
  durationMs?: number;
}

/**
 * Structured application logger for diagnostic telemetry, performance tracking, and health metrics.
 */
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

  /** Log a low-priority debug event */
  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  /** Log an informational operational event */
  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  /** Log a non-critical operational warning */
  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  /** Log an unhandled error or operational failure */
  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  /**
   * Start a high-resolution performance marker.
   * @param label Operational label for the timed execution block.
   * @returns A callback function that stops the timer and logs the elapsed duration in milliseconds.
   */
  time(label: string): () => number {
    const start = performance.now();
    return () => {
      const durationMs = +(performance.now() - start).toFixed(2);
      this.log('info', `Performance mark: ${label}`, { durationMs }, durationMs);
      return durationMs;
    };
  }

  /** Return a copy of all buffered log entries */
  getLogs(): LogEvent[] {
    return [...this.logs];
  }

  /**
   * Perform a quick system health check returning uptime and log status.
   */
  checkHealth(): { status: 'OK' | 'DEGRADED'; uptimeSeconds: number; logCount: number } {
    return {
      status: 'OK',
      uptimeSeconds: Math.floor(performance.now() / 1000),
      logCount: this.logs.length,
    };
  }
}

/** Global singleton instance of the MirrorTrap application logger */
export const logger = new Logger();
