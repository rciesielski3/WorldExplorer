/**
 * Error handling types and utilities for WorldExplorer
 * Provides a standardized way to handle API errors, network failures, and validation errors
 */

export type ErrorType =
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'INVALID_DATA'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface ApiError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  originalError?: Error | string;
  retryable: boolean;
  timestamp: number;
}

/**
 * Predefined error definitions with retryability flags
 * Used to categorize API errors consistently across all screens
 */
export const ERRORS = {
  NETWORK: {
    type: 'NETWORK' as const,
    message: 'Network connection error. Please check your internet connection.',
    retryable: true,
  },
  NOT_FOUND: {
    type: 'NOT_FOUND' as const,
    message: 'Resource not found.',
    retryable: false,
  },
  INVALID_DATA: {
    type: 'INVALID_DATA' as const,
    message: 'Invalid or corrupted data received.',
    retryable: true,
  },
  UNAUTHORIZED: {
    type: 'UNAUTHORIZED' as const,
    message: 'Unauthorized. Please check your credentials.',
    retryable: false,
  },
  SERVER_ERROR: {
    type: 'SERVER_ERROR' as const,
    message: 'Server error. Please try again later.',
    retryable: true,
  },
  UNKNOWN: {
    type: 'UNKNOWN' as const,
    message: 'An unexpected error occurred.',
    retryable: true,
  },
} as const;

/**
 * Create an ApiError from various sources
 * Standardizes error handling across the app
 */
export function createApiError(
  type: ErrorType = 'UNKNOWN',
  customMessage?: string,
  originalError?: Error | string,
  statusCode?: number
): ApiError {
  const errorDef = ERRORS[type];

  return {
    type,
    message: customMessage || errorDef.message,
    statusCode,
    originalError,
    retryable: errorDef.retryable,
    timestamp: Date.now(),
  };
}

/**
 * Classify an error from a network request
 * Used in catch blocks to standardize error handling
 */
export function classifyError(error: unknown): ApiError {
  if (!error) {
    return createApiError('UNKNOWN');
  }

  // Helper: normalise unknown to the shape createApiError expects
  const toErrorOrString = (e: unknown): Error | string =>
    e instanceof Error ? e : String(e);

  // Primitive (non-object) error value
  if (typeof error !== 'object') {
    return createApiError('UNKNOWN', String(error));
  }

  const errorObj = error as Record<string, unknown>;

  // Network errors
  if (
    errorObj['code'] === 'ECONNABORTED' ||
    (typeof errorObj['message'] === 'string' && errorObj['message'].includes('Network'))
  ) {
    return createApiError('NETWORK', undefined, toErrorOrString(error));
  }

  // HTTP status code errors
  if (typeof errorObj['response'] === 'object' && errorObj['response'] !== null) {
    const response = errorObj['response'] as Record<string, unknown>;
    if (typeof response['status'] === 'number') {
      const status = response['status'];
      const data =
        typeof response['data'] === 'object' && response['data'] !== null
          ? (response['data'] as Record<string, unknown>)
          : null;
      const message =
        data && typeof data['message'] === 'string' ? data['message'] : undefined;

      if (status === 404) {
        return createApiError('NOT_FOUND', message, toErrorOrString(error), status);
      }
      if (status === 401 || status === 403) {
        return createApiError('UNAUTHORIZED', message, toErrorOrString(error), status);
      }
      if (status >= 500) {
        return createApiError('SERVER_ERROR', message, toErrorOrString(error), status);
      }
      if (status >= 400) {
        return createApiError('INVALID_DATA', message, toErrorOrString(error), status);
      }
    }
  }

  // JSON parse errors or invalid data
  if (
    (typeof errorObj['message'] === 'string' && errorObj['message'].includes('JSON')) ||
    error instanceof SyntaxError
  ) {
    return createApiError('INVALID_DATA', undefined, toErrorOrString(error));
  }

  // Fallback
  const fallbackMessage =
    typeof errorObj['message'] === 'string' ? errorObj['message'] : undefined;
  return createApiError('UNKNOWN', fallbackMessage, toErrorOrString(error));
}
