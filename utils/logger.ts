/**
 * Structured Error Logging System
 *
 * This logger provides a production-ready structured logging interface.
 * It's designed to integrate seamlessly with error tracking services like Sentry or Firebase.
 *
 * Usage:
 *   logger.error('API call failed', {
 *     context: 'CountryDetailsScreen',
 *     userId: user?.id,
 *     metadata: { countryCode: 'US', endpoint: '/api/countries' }
 *   });
 */

export interface LogContext {
  /** Where the error occurred (screen, component, utility) */
  context: string;
  /** User ID if relevant to the error */
  userId?: string;
  /** ISO timestamp string */
  timestamp: string;
  /** Additional structured data */
  metadata?: Record<string, any>;
}

interface LogEntry {
  level: 'error' | 'warn' | 'info';
  message: string;
  context: LogContext;
}

/**
 * Internal buffer for logs (can be sent to external service)
 */
let logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Format log message for console output
 */
function formatLogMessage(level: string, message: string, ctx: LogContext): string {
  const { context, userId, timestamp, metadata } = ctx;
  const metadataStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
  const userStr = userId ? ` | user:${userId}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${context}]${userStr}${metadataStr} ${message}`;
}

/**
 * Add log entry to buffer (for integration with external services)
 */
function bufferLog(entry: LogEntry): void {
  logBuffer.push(entry);

  // Keep buffer size manageable
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer = logBuffer.slice(-MAX_BUFFER_SIZE);
  }
}

/**
 * Get current log buffer (useful for debugging or sending to external service)
 */
export function getLogBuffer(): LogEntry[] {
  return [...logBuffer];
}

/**
 * Clear log buffer
 */
export function clearLogBuffer(): void {
  logBuffer = [];
}

/**
 * Send logs to external service (Sentry, Firebase, etc.)
 * This is a hook point for integration
 */
export type LogHandler = (entry: LogEntry) => void | Promise<void>;
let customLogHandler: LogHandler | null = null;

export function setLogHandler(handler: LogHandler): void {
  customLogHandler = handler;
}

/**
 * Main logger object with structured logging methods
 */
export const logger = {
  /**
   * Log an error
   *
   * @param message - Error message
   * @param ctx - Context information including where the error occurred
   * @example
   * logger.error('Failed to fetch country data', {
   *   context: 'HomeScreen',
   *   userId: currentUser?.id,
   *   metadata: { countryCode: 'US', endpoint: '/api/country' }
   * });
   */
  error: (message: string, ctx: LogContext): void => {
    const entry: LogEntry = {
      level: 'error',
      message,
      context: ctx,
    };

    // Buffer the log
    bufferLog(entry);

    // Console output
    console.error(formatLogMessage('error', message, ctx));

    // Call custom handler if set (for Sentry/Firebase integration)
    if (customLogHandler) {
      try {
        customLogHandler(entry);
      } catch (err) {
        console.error('Failed to send log to handler:', err);
      }
    }
  },

  /**
   * Log a warning
   *
   * @param message - Warning message
   * @param ctx - Context information
   * @example
   * logger.warn('Theme preference not saved', {
   *   context: 'ThemeContext',
   *   metadata: { reason: 'AsyncStorage error' }
   * });
   */
  warn: (message: string, ctx: LogContext): void => {
    const entry: LogEntry = {
      level: 'warn',
      message,
      context: ctx,
    };

    // Buffer the log
    bufferLog(entry);

    // Console output
    console.warn(formatLogMessage('warn', message, ctx));

    // Call custom handler if set
    if (customLogHandler) {
      try {
        customLogHandler(entry);
      } catch (err) {
        console.error('Failed to send log to handler:', err);
      }
    }
  },

  /**
   * Log informational message
   * Use sparingly in production - only for important state changes or milestones
   *
   * @param message - Info message
   * @param ctx - Optional context information
   * @example
   * logger.info('User completed quiz', {
   *   context: 'QuizScreen',
   *   userId: currentUser?.id,
   *   metadata: { score: 85, questionsAnswered: 10 }
   * });
   */
  info: (message: string, ctx?: LogContext): void => {
    const context = ctx || {
      context: 'app',
      timestamp: new Date().toISOString(),
    };

    const entry: LogEntry = {
      level: 'info',
      message,
      context,
    };

    // Buffer the log
    bufferLog(entry);

    // Console output (can be disabled in production if needed)
    if (__DEV__) {
      console.log(formatLogMessage('info', message, context));
    }

    // Call custom handler if set
    if (customLogHandler) {
      try {
        customLogHandler(entry);
      } catch (err) {
        console.error('Failed to send log to handler:', err);
      }
    }
  },
};

export default logger;
