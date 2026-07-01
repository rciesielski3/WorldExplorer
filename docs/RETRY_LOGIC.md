# Retry Logic Implementation Guide

This document explains how to use the retry logic with exponential backoff throughout the WorldExplorer application.

## Overview

The retry system provides automatic retry capability with exponential backoff for resilient API calls. It includes:

- **Exponential Backoff**: Delays increase by 2x with each retry (1s, 2s, 4s, etc.)
- **Configurable Retries**: Set max retry attempts and base delay per operation
- **User-Visible UI**: Error banners with retry buttons for manual user intervention
- **Logging**: Automatic logging of retry attempts and failures
- **Type Safe**: Full TypeScript support

## Core Utilities

### `retryWithBackoff(fn, options)`

Basic retry function for executing async operations.

**Location**: `utils/retry.ts`

**Usage**:

```typescript
import { retryWithBackoff } from '../utils/retry';

// Basic usage
const data = await retryWithBackoff(() => fetchSomeData());

// With options
const data = await retryWithBackoff(
  () => fetchSomeData(),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 32000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    }
  }
);
```

### `retryWithBackoffNamed(fn, name, options)`

Retry function with additional logging using operation name.

**Usage**:

```typescript
import { retryWithBackoffNamed } from '../utils/retry';

const data = await retryWithBackoffNamed(
  () => fetchCountries(),
  'fetchCountries',
  {
    maxRetries: 3,
    baseDelay: 1000,
  }
);
```

## Custom Hooks

### `useRetry<T>(fn, name, options)`

React hook for managing async operations with retry state.

**Location**: `src/hooks/useRetry.ts`

**Returns**:

```typescript
{
  data: T | null,                    // The result data
  error: Error | null,                // Any error that occurred
  isLoading: boolean,                 // Initial load state
  isRetrying: boolean,                // Manual retry in progress
  retryCount: number,                 // Number of manual retries
  execute: () => Promise<void>,      // Start the operation
  retry: () => Promise<void>,        // Manual retry
  reset: () => void,                 // Reset state
}
```

**Usage**:

```typescript
import { useRetry } from '../src/hooks/useRetry';

const MyComponent = () => {
  const {
    data,
    error,
    isLoading,
    isRetrying,
    retryCount,
    execute,
    retry,
  } = useRetry(
    () => fetchCountries(),
    'fetchCountries',
    {
      maxRetries: 3,
      baseDelay: 1000,
      onSuccess: () => console.log('Success!'),
      onError: (error) => console.error('Failed:', error),
    }
  );

  // Load on mount
  React.useEffect(() => {
    execute();
  }, [execute]);

  return (
    <>
      {isLoading && <ActivityIndicator />}
      {data && <CountryList countries={data} />}
      {error && (
        <Button
          label="Retry"
          onPress={retry}
          disabled={isRetrying}
        />
      )}
    </>
  );
};
```

## UI Components

### `RetryErrorBanner`

Display-only error banner with retry and dismiss buttons.

**Location**: `src/components/ui/RetryErrorBanner.tsx`

**Props**:

```typescript
interface RetryErrorBannerProps {
  visible: boolean;              // Show/hide the banner
  error?: Error | string;        // Error message to display
  onRetry: () => void;          // Callback when retry button pressed
  onDismiss?: () => void;       // Callback when dismiss button pressed
  retryCount?: number;          // Number of retries (for display)
  maxRetries?: number;          // Max retries (for display)
  isRetrying?: boolean;         // Show loading state during retry
  showDismiss?: boolean;        // Show dismiss button
}
```

**Usage**:

```typescript
import { RetryErrorBanner } from '../src/components/ui/RetryErrorBanner';

<RetryErrorBanner
  visible={!!error}
  error={error}
  onRetry={retry}
  onDismiss={() => setError(null)}
  retryCount={retryCount}
  maxRetries={3}
  isRetrying={isRetrying}
  showDismiss={true}
/>
```

## Implementation Pattern

### Pattern 1: Using `useRetry` Hook (Recommended)

Best for screens that need full retry state management:

```typescript
const MyScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Use retry hook
  const {
    data: countries,
    error,
    isLoading,
    isRetrying,
    retryCount,
    execute,
    retry,
  } = useRetry(
    () => fetchCountries(),
    'MyScreen-fetchCountries',
    {
      maxRetries: 3,
      baseDelay: 1000,
      onError: (error) => {
        logger.error('Countries load failed', {
          context: 'MyScreen',
          metadata: { error: error.message },
        });
      },
    }
  );

  // Load on mount
  React.useEffect(() => {
    execute();
  }, [execute]);

  return (
    <>
      <RetryErrorBanner
        visible={!!error}
        error={error}
        onRetry={retry}
        retryCount={retryCount}
        isRetrying={isRetrying}
      />

      {isLoading && <ActivityIndicator />}
      {countries && <CountryList countries={countries} />}
    </>
  );
};
```

### Pattern 2: Using `retryWithBackoffNamed` (For Effects)

Best for side effects in useEffect:

```typescript
React.useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    try {
      const data = await retryWithBackoffNamed(
        () => fetchCountries(),
        'loadCountries',
        { maxRetries: 3, baseDelay: 1000 }
      );
      if (isMounted) {
        setCountries(data);
        setError(null);
      }
    } catch (error) {
      if (isMounted) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  loadData();

  return () => {
    isMounted = false;
  };
}, []);
```

### Pattern 3: Context API Operations

For operations in context providers (e.g., PremiumContext):

```typescript
const refreshCustomerInfo = React.useCallback(async () => {
  if (!isConfigured) return;

  try {
    const customerInfo = await retryWithBackoffNamed(
      () => Purchases.getCustomerInfo(),
      'refreshCustomerInfo',
      { maxRetries: 3, baseDelay: 1000 }
    );
    applyCustomerInfo(customerInfo);
    setError(null);
  } catch (error) {
    setError(
      error instanceof Error ? error.message : 'Refresh failed'
    );
  }
}, [isConfigured]);
```

## Retry Configuration

### Default Settings

- **maxRetries**: 3 attempts
- **baseDelay**: 1000ms (1 second)
- **maxDelay**: 32000ms (32 seconds)

### Recommended Settings by Type

**Network Calls (Recommended)**:
```typescript
{
  maxRetries: 3,
  baseDelay: 1000,    // 1s, 2s, 4s
}
```

**Premium/Purchase Operations (Conservative)**:
```typescript
{
  maxRetries: 2,
  baseDelay: 1000,    // 1s, 2s
}
```

**Data Fetches (Aggressive)**:
```typescript
{
  maxRetries: 5,
  baseDelay: 500,     // 500ms, 1s, 2s, 4s, 8s
}
```

## Logging

All retry attempts are logged automatically with:

- Operation name
- Attempt number
- Error message
- Delay before retry

**Example Console Output**:
```
[Retry] Attempt 1 failed, retrying in 1000ms...
  error: "Network timeout"
  attempt: 1
  maxRetries: 3

[fetchCountries] Retry attempt 1: Network timeout
```

## Error Handling Best Practices

1. **Always provide meaningful error messages**
   ```typescript
   throw new Error('Failed to fetch countries: Connection timeout');
   ```

2. **Log errors with context**
   ```typescript
   logger.error('API call failed', {
     context: 'ComponentName',
     metadata: { operation: 'fetchCountries' },
   });
   ```

3. **Show user-friendly messages**
   ```typescript
   <RetryErrorBanner
     error="Network connection failed. Please check your internet and try again."
     onRetry={retry}
   />
   ```

4. **Respect user cancellation**
   ```typescript
   React.useEffect(() => {
     let isMounted = true;
     // ... async operations ...
     return () => {
       isMounted = false; // Prevents setting state on unmounted component
     };
   }, []);
   ```

## Testing Retry Logic

### Test with Network Disabled

To verify retry works correctly:

1. **iOS Simulator**:
   - Xcode → Simulate Hardware → Network Link Conditioner
   - Or disable WiFi/Cellular

2. **Android Emulator**:
   - Settings → Network Settings → Disable Network
   - Or use emulator's network controls

3. **Manual Network Failure**:
   ```typescript
   // Mock a failing API call
   const failingFetch = async () => {
     throw new Error('Network error');
   };

   // Verify retry happens
   await retryWithBackoff(failingFetch);
   ```

### Observe Exponential Backoff

Check browser console or device logs:
- First retry: ~1000ms delay
- Second retry: ~2000ms delay
- Third retry: ~4000ms delay

### Test Error UI

1. Mock API failure:
   ```typescript
   fetchCountries = async () => {
     throw new Error('API Error');
   };
   ```

2. Verify error banner appears
3. Verify retry button works
4. Verify dismiss button hides banner

## Performance Considerations

### Memory Usage

- `useRetry` hook maintains state for data, error, and status
- Each retry keeps error objects in memory
- Consider resetting state for large data sets

### Network Impact

- Exponential backoff prevents overwhelming servers
- Max delay cap (32s) prevents excessively long waits
- Respects user cancellation (navigation away)

### Battery Impact

- Retry delays allow phone to enter low-power states
- Exponential backoff is more efficient than linear

## Troubleshooting

### Retries Not Happening

Check that:
1. Function throws an error (doesn't just return null/undefined)
2. `maxRetries` is > 0
3. Error is not user-cancelled

### Too Many Retries

Adjust `maxRetries`:
```typescript
{
  maxRetries: 2,  // Reduce from 3
  baseDelay: 1000,
}
```

### Retries Too Fast

Increase `baseDelay`:
```typescript
{
  maxRetries: 3,
  baseDelay: 2000,  // Increase from 1000
}
```

### Retries Too Slow

Decrease `baseDelay`:
```typescript
{
  maxRetries: 3,
  baseDelay: 500,   // Decrease from 1000
}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Jitter**: Add random jitter to prevent thundering herd
2. **Circuit Breaker**: Fail fast if service is down
3. **Adaptive Backoff**: Adjust delays based on response times
4. **Request Timeout**: Add timeout parameter
5. **Telemetry**: Track retry success rates and patterns
6. **User Preferences**: Allow users to disable auto-retry

## Related Files

- Core retry logic: `utils/retry.ts`
- React hook: `src/hooks/useRetry.ts`
- Error UI: `src/components/ui/RetryErrorBanner.tsx`
- Premium context (example): `context/PremiumContext.js`
- Home screen (example): `screens/HomeScreen.tsx`
- Countries utility (example): `utils/countries.ts`
