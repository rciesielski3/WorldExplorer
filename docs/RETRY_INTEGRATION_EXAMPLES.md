# Retry Logic Integration Examples

This document provides copy-paste ready examples for integrating retry logic into different screens and components.

## Quick Migration Checklist

For each screen/component that makes API calls:

- [ ] Import `useRetry` hook
- [ ] Import `RetryErrorBanner` component
- [ ] Replace manual state management with `useRetry`
- [ ] Add error banner to JSX
- [ ] Test with network disabled
- [ ] Add logging

## Example 1: HomeScreen (Complete Implementation)

**File**: `screens/HomeScreen.tsx`

```typescript
import React from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { RetryErrorBanner } from '../src/components/ui/RetryErrorBanner';
import { fetchCountries, getLocalizedCountryName } from '../utils/countries';
import { getDailyCountry } from '../utils/dailyCountry';
import { useRetry } from '../src/hooks/useRetry';
import { logger } from '../utils/logger';

const HomeScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // Load daily country with retry
  const {
    data: dailyCountry,
    error: dailyCountryError,
    isLoading: isDailyCountryLoading,
    isRetrying: isDailyCountryRetrying,
    retryCount: dailyCountryRetryCount,
    execute: loadDailyCountry,
    retry: retryDailyCountry,
  } = useRetry(
    async () => {
      const countriesData = await fetchCountries();
      return getDailyCountry(countriesData);
    },
    'HomeScreen-loadDailyCountry',
    {
      maxRetries: 3,
      baseDelay: 1000,
      onError: (error) => {
        logger.error('Failed to load daily country', {
          context: 'HomeScreen',
          metadata: { error: error.message },
        });
      },
    }
  );

  // Load on mount
  React.useEffect(() => {
    loadDailyCountry();
  }, [loadDailyCountry]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Error banner */}
      <RetryErrorBanner
        visible={!!dailyCountryError}
        error={dailyCountryError}
        onRetry={retryDailyCountry}
        retryCount={dailyCountryRetryCount}
        maxRetries={3}
        isRetrying={isDailyCountryRetrying}
        showDismiss={true}
      />

      <ScrollView>
        {/* Content */}
        {isDailyCountryLoading && (
          <ActivityIndicator color={theme.colors.primary} size="large" />
        )}

        {dailyCountry && (
          <View>
            {/* Render daily country */}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
```

## Example 2: QuizScreen Migration

**File**: `screens/quiz/QuizScreen.tsx`

```typescript
// Add to imports
import { RetryErrorBanner } from "../../src/components/ui/RetryErrorBanner";
import { useRetry } from "../../src/hooks/useRetry";

// In component
const QuizScreen = ({ route, navigation }: any) => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const practiceQuestions = route.params?.practiceQuestions;

  // Use retry for loading questions
  const {
    data: questions = [],
    error: questionsError,
    isLoading: isQuestionsLoading,
    isRetrying: isQuestionsRetrying,
    retryCount: questionsRetryCount,
    execute: loadQuestions,
    retry: retryQuestions,
  } = useRetry(
    async () => {
      const countries = await fetchCountries();
      return generateQuestions(countries);
    },
    'QuizScreen-loadQuestions',
    { maxRetries: 3, baseDelay: 1000 }
  );

  React.useEffect(() => {
    if (practiceQuestions?.length) {
      // Use practice questions directly
      return;
    }
    loadQuestions();
  }, [loadQuestions, practiceQuestions]);

  return (
    <View style={{ flex: 1 }}>
      <TopBar title={t("quiz")} />

      <RetryErrorBanner
        visible={!!questionsError}
        error={questionsError}
        onRetry={retryQuestions}
        isRetrying={isQuestionsRetrying}
        showDismiss={false}
      />

      {isQuestionsLoading && <ActivityIndicator />}

      {questions.length > 0 && (
        // Render questions
      )}
    </View>
  );
};
```

## Example 3: ExploreScreen with Multiple Data Loads

**File**: `src/screens/ExploreScreen.tsx`

```typescript
import { useRetry } from '../hooks/useRetry';
import { RetryErrorBanner } from '../components/ui/RetryErrorBanner';

export const ExploreScreen = ({ navigation }: any) => {
  // Load countries
  const {
    data: countries,
    error: countriesError,
    isLoading: isCountriesLoading,
    retry: retryCountries,
    retryCount: countriesRetryCount,
    isRetrying: isCountriesRetrying,
    execute: loadCountries,
  } = useRetry(
    () => fetchCountries(),
    'ExploreScreen-loadCountries',
    { maxRetries: 3, baseDelay: 1000 }
  );

  React.useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  return (
    <>
      <RetryErrorBanner
        visible={!!countriesError}
        error={countriesError}
        onRetry={retryCountries}
        retryCount={countriesRetryCount}
        isRetrying={isCountriesRetrying}
      />

      {isCountriesLoading && <ActivityIndicator />}
      {countries && <CountryList countries={countries} />}
    </>
  );
};
```

## Example 4: Manual Retry Without Hook

**File**: `utils/someUtility.ts`

For utilities that don't need React state:

```typescript
import { retryWithBackoffNamed } from './retry';

export async function loadCountriesWithRetry() {
  return retryWithBackoffNamed(
    async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    'loadCountriesWithRetry',
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );
}

// Usage
try {
  const countries = await loadCountriesWithRetry();
  setCountries(countries);
} catch (error) {
  setError(error);
}
```

## Example 5: Context API with Retry (PremiumContext Pattern)

**File**: `context/PremiumContext.js`

```javascript
import { retryWithBackoffNamed } from '../utils/retry';

const PremiumProvider = ({ children }) => {
  // ... state setup ...

  const refreshCustomerInfo = React.useCallback(async () => {
    if (!isConfigured) return;

    try {
      // Wrap API call with retry
      const customerInfo = await retryWithBackoffNamed(
        () => Purchases.getCustomerInfo(),
        'PremiumContext-refreshCustomerInfo',
        {
          maxRetries: 3,
          baseDelay: 1000,
        }
      );

      applyCustomerInfo(customerInfo);
      setError(null);
    } catch (error) {
      setError(error?.message || 'Failed to refresh customer info');
    }
  }, [isConfigured, applyCustomerInfo]);

  // ... rest of component ...
};
```

## Example 6: Component with Error UI and Multiple Operations

```typescript
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRetry } from '../src/hooks/useRetry';
import { RetryErrorBanner } from '../src/components/ui/RetryErrorBanner';

export const DataComponent = () => {
  // First data load
  const firstData = useRetry(
    () => fetchFirstData(),
    'DataComponent-firstData'
  );

  // Second data load (independent)
  const secondData = useRetry(
    () => fetchSecondData(),
    'DataComponent-secondData'
  );

  React.useEffect(() => {
    firstData.execute();
    secondData.execute();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* First error banner */}
      <RetryErrorBanner
        visible={!!firstData.error}
        error={firstData.error}
        onRetry={firstData.retry}
        isRetrying={firstData.isRetrying}
      />

      {/* Second error banner */}
      <RetryErrorBanner
        visible={!!secondData.error}
        error={secondData.error}
        onRetry={secondData.retry}
        isRetrying={secondData.isRetrying}
      />

      <ScrollView>
        {firstData.isLoading && <ActivityIndicator />}
        {firstData.data && <FirstDataView data={firstData.data} />}

        {secondData.isLoading && <ActivityIndicator />}
        {secondData.data && <SecondDataView data={secondData.data} />}
      </ScrollView>
    </View>
  );
};
```

## Migration Pattern: Before and After

### Before (Manual Error Handling)

```typescript
const MyScreen = () => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    fetchData()
      .then((result) => {
        if (isMounted) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error.message}</Text>}
      {data && <DataView data={data} />}
    </View>
  );
};
```

### After (With Retry Logic)

```typescript
const MyScreen = () => {
  const {
    data,
    error,
    isLoading,
    isRetrying,
    retryCount,
    execute,
    retry,
  } = useRetry(
    () => fetchData(),
    'MyScreen-fetchData',
    { maxRetries: 3, baseDelay: 1000 }
  );

  React.useEffect(() => {
    execute();
  }, [execute]);

  return (
    <View>
      <RetryErrorBanner
        visible={!!error}
        error={error}
        onRetry={retry}
        isRetrying={isRetrying}
        retryCount={retryCount}
      />

      {isLoading && <ActivityIndicator />}
      {data && <DataView data={data} />}
    </View>
  );
};
```

## Key Differences

| Feature | Before | After |
|---------|--------|-------|
| Error Handling | Manual try-catch | Automatic via hook |
| Retry UI | None | Built-in banner |
| Retry Logic | None | Exponential backoff |
| User Control | None | Retry button |
| Logging | Manual | Automatic |
| Code Lines | 30+ | 10-15 |
| Boilerplate | High | Low |

## Testing Your Integration

### 1. Verify Data Loads

```bash
npm test -- --testPathPattern="YourScreen"
```

### 2. Test with Network Disabled

- Device Settings → Airplane Mode
- Or WiFi/Cellular disabled

### 3. Mock API Failure

```typescript
// In test or mock
jest.mock('../utils/countries', () => ({
  fetchCountries: jest.fn().mockRejectedValue(
    new Error('Network error')
  ),
}));
```

### 4. Observe Console Logs

Look for retry messages:
```
[Retry] Attempt 1 failed, retrying in 1000ms...
[MyScreen-operation] Retry attempt 1: Network timeout
```

## Common Integration Issues

### Issue: Error banner not appearing

**Solution**: Check that error state is being set:
```typescript
// Add console.log to verify
onError: (error) => {
  console.log('Error occurred:', error);
}
```

### Issue: Retries not happening

**Solution**: Ensure function throws an error:
```typescript
// Wrong - returns undefined
const fn = async () => { null };

// Right - throws error
const fn = async () => {
  throw new Error('Failed');
};
```

### Issue: Too many retries

**Solution**: Reduce maxRetries:
```typescript
useRetry(fn, 'operation', {
  maxRetries: 2,  // Was 3
  baseDelay: 1000,
})
```

## Next Steps

1. Pick a screen to migrate first (HomeScreen or QuizScreen)
2. Copy example code above
3. Test with network disabled
4. Observe logs and verify retry happens
5. Roll out to other screens
6. Monitor production logs for retry patterns
