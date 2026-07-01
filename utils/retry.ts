/**
 * Retry utility with exponential backoff for resilient API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Execute a function with automatic retry and exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 32000,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calculate exponential backoff delay: baseDelay * 2^attempt, capped at maxDelay
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      // Call the retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Log the retry attempt
      console.warn(
        `[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries,
        }
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error("Retry failed for unknown reason");
}

/**
 * Execute a function with retry, with additional error handling and logging
 * @param fn - The async function to retry
 * @param name - Name of the operation (for logging)
 * @param options - Retry configuration options
 * @returns The result of the function
 */
export async function retryWithBackoffNamed<T>(
  fn: () => Promise<T>,
  name: string,
  options: RetryOptions = {}
): Promise<T> {
  const enhancedOptions: RetryOptions = {
    ...options,
    onRetry: (attempt: number, error: Error) => {
      console.warn(`[${name}] Retry attempt ${attempt}:`, error.message);
      options.onRetry?.(attempt, error);
    },
  };

  try {
    console.debug(`[${name}] Starting operation`);
    const result = await retryWithBackoff(fn, enhancedOptions);
    console.debug(`[${name}] Operation completed successfully`);
    return result;
  } catch (error) {
    console.error(
      `[${name}] Operation failed after ${enhancedOptions.maxRetries} attempts:`,
      error
    );
    throw error;
  }
}
