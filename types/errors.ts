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
export function classifyError(error: any): ApiError {
  if (!error) {
    return createApiError('UNKNOWN');
  }

  // Network errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('Network')) {
    return createApiError('NETWORK', undefined, error);
  }

  // HTTP status code errors
  if (error.response?.status) {
    const status = error.response.status;
    const message = error.response.data?.message;

    if (status === 404) {
      return createApiError('NOT_FOUND', message, error, status);
    }

    if (status === 401 || status === 403) {
      return createApiError('UNAUTHORIZED', message, error, status);
    }

    if (status >= 500) {
      return createApiError('SERVER_ERROR', message, error, status);
    }

    if (status >= 400) {
      return createApiError('INVALID_DATA', message, error, status);
    }
  }

  // JSON parse errors or invalid data
  if (error.message?.includes('JSON') || error instanceof SyntaxError) {
    return createApiError('INVALID_DATA', undefined, error);
  }

  // Fallback
  return createApiError('UNKNOWN', error.message, error);
}
