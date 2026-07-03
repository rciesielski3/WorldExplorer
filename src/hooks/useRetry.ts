import React, { useState, useCallback } from 'react';
import { retryWithBackoffNamed } from '../../utils/retry';

export interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseRetryReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing API calls with retry logic
 * @param fn - The async function to execute
 * @param name - Name of the operation (for logging)
 * @param options - Configuration options
 * @returns Object with data, error, loading state, and retry/execute functions
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  name: string,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const result = await retryWithBackoffNamed(fn, name, {
        maxRetries,
        baseDelay,
      });
      setData(result);
      setError(null);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [fn, name, maxRetries, baseDelay, onSuccess, onError]);

  const retry = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    setRetryCount((prev) => prev + 1);

    try {
      const result = await retryWithBackoffNamed(fn, `${name}-manual-retry`, {
        maxRetries: 2,
        baseDelay,
      });
      setData(result);
      setError(null);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsRetrying(false);
    }
  }, [fn, name, baseDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    data,
    error,
    isLoading,
    isRetrying,
    retryCount,
    execute,
    retry,
    reset,
  };
}
