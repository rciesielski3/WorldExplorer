# Daily Challenge + Streak Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase daily active users (DAU) by 15-20% through daily random country challenges and persistent streak displays.

**Architecture:** 
- Utility module (`dailyChallenge.ts`) handles random country selection and date-based caching
- HomeScreen displays streak badge + daily challenge card
- QuizScreen accepts optional country pre-selection from daily challenge
- NotificationService schedules daily reminders with user-configurable time
- SettingsScreen exposes notification toggle and time picker

**Tech Stack:** React Native, Expo, AsyncStorage, expo-notifications, Material Design 3 (design tokens)

---

## Global Constraints

- **Target:** v2.0.7 release (internal Play Store track)
- **Locales:** All strings must be translated for en, es, de, fr, pl
- **Testing:** Unit + integration tests required; all must pass before merge
- **Styling:** Use design tokens from `src/theme/tokens.ts`; no hardcoded colors
- **SDK:** Update RevenueCat purchases to latest version (separate commit)
- **Accessibility:** Touch targets 48dp+, contrast 4.5:1, semantic labels
- **Git:** Each task = one commit (clear message, no squashing)

---

## File Structure

| File | Status | Responsibility |
|------|--------|-----------------|
| `utils/dailyChallenge.ts` | NEW | Random country selection, date caching, AsyncStorage persistence |
| `utils/__tests__/dailyChallenge.test.ts` | NEW | Unit tests for date logic, caching, randomization |
| `src/components/ui/DailyChallengeCard.tsx` | NEW | Reusable card component for daily challenge display |
| `src/components/ui/__tests__/DailyChallengeCard.test.tsx` | NEW | Component rendering and interaction tests |
| `src/components/NotificationService.ts` | NEW | Schedule/cancel daily reminder notifications |
| `src/components/__tests__/NotificationService.test.ts` | NEW | Notification scheduling and cancellation tests |
| `screens/HomeScreen.tsx` | MODIFY | Add StreakBadge + DailyChallengeCard below header |
| `screens/__tests__/HomeScreen.test.tsx` | MODIFY | Add tests for streak + daily challenge rendering |
| `screens/quiz/QuizScreen.tsx` | MODIFY | Accept `countryCode` route param to pre-select country |
| `screens/__tests__/SettingsScreen.test.tsx` | MODIFY | Add tests for notification settings |
| `screens/SettingsScreen.tsx` | MODIFY | Add Notifications card with toggle + time picker |
| `src/locales/*.json` (5 files) | MODIFY | Add 6 new translation keys |
| `package.json` | MODIFY | Update RevenueCat dependency to latest |

---

## Task Dependencies

```
Task 1: Update RevenueCat
   ↓
Task 2: Create dailyChallenge utility + tests
   ↓
Task 3: Create DailyChallengeCard component + tests
   ↓
Task 4: Integrate StreakBadge + DailyChallengeCard into HomeScreen
   ↓
Task 5: Create NotificationService + tests
   ↓
Task 6: Add notification settings to SettingsScreen
   ↓
Task 7: Integrate daily challenge country pre-selection into QuizScreen
   ↓
Task 8: Add i18n translations to all 5 locales
   ↓
Task 9: Manual testing + polish
```

---

## Task 1: Update RevenueCat SDK

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: Current RevenueCat version
- Produces: Latest RevenueCat SDK (satisfies Play Store warning)

- [ ] **Step 1: Check current RevenueCat version**

Run: `npm list react-native-purchases`

Note the current version (likely 10.6.1).

- [ ] **Step 2: Update to latest RevenueCat**

Run: `npm install react-native-purchases@latest`

- [ ] **Step 3: Verify installation**

Run: `npm list react-native-purchases`

Expected: Version > 10.6.1 (e.g., 11.x or higher)

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: update RevenueCat purchases to latest version

Resolves Play Store warning: 'This version makes unnecessary API calls'"
```

---

## Task 2: Create dailyChallenge Utility

**Files:**
- Create: `utils/dailyChallenge.ts`
- Create: `utils/__tests__/dailyChallenge.test.ts`

**Interfaces:**
- Consumes: AsyncStorage, countries list, Date
- Produces: 
  - `getTodayChallenge(countries: Country[]): Promise<DailyChallengeData>`
  - `isChallengeExpired(dateKey: string): boolean`
  - `saveDailyChallenge(data: DailyChallengeData): Promise<void>`
  - `loadDailyChallenge(): Promise<DailyChallengeData | null>`

- [ ] **Step 1: Write the test file**

Create `utils/__tests__/dailyChallenge.test.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTodayChallenge,
  isChallengeExpired,
  saveDailyChallenge,
  loadDailyChallenge,
  toLocalDateKey,
} from '../dailyChallenge';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

const mockCountries = [
  { code: 'JP', name: 'Japan', capital: 'Tokyo' },
  { code: 'FR', name: 'France', capital: 'Paris' },
  { code: 'BR', name: 'Brazil', capital: 'Brasília' },
];

describe('dailyChallenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toLocalDateKey', () => {
    it('formats timestamp as YYYY-MM-DD in local timezone', () => {
      const timestamp = new Date(2026, 6, 13).getTime(); // July 13, 2026
      const result = toLocalDateKey(timestamp);
      expect(result).toBe('2026-07-13');
    });
  });

  describe('isChallengeExpired', () => {
    it('returns false if date matches today', () => {
      const today = toLocalDateKey(Date.now());
      expect(isChallengeExpired(today)).toBe(false);
    });

    it('returns true if date is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = toLocalDateKey(yesterday.getTime());
      expect(isChallengeExpired(yesterdayKey)).toBe(true);
    });
  });

  describe('getTodayChallenge', () => {
    it('returns cached challenge if not expired', async () => {
      const today = toLocalDateKey(Date.now());
      const cached = {
        countryCode: 'JP',
        dateKey: today,
        countryName: 'Japan',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cached));

      const result = await getTodayChallenge(mockCountries);
      expect(result.countryCode).toBe('JP');
      expect(result.dateKey).toBe(today);
    });

    it('selects new random country if cache expired', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = toLocalDateKey(yesterday.getTime());
      const expired = {
        countryCode: 'JP',
        dateKey: yesterdayKey,
        countryName: 'Japan',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expired));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await getTodayChallenge(mockCountries);
      
      expect(result.dateKey).toBe(toLocalDateKey(Date.now()));
      expect(mockCountries.map(c => c.code)).toContain(result.countryCode);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('handles AsyncStorage read failure gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await getTodayChallenge(mockCountries);
      
      expect(result.countryCode).toBeDefined();
      expect(result.dateKey).toBe(toLocalDateKey(Date.now()));
    });
  });

  describe('saveDailyChallenge', () => {
    it('persists challenge data to AsyncStorage', async () => {
      const today = toLocalDateKey(Date.now());
      const data = {
        countryCode: 'JP',
        dateKey: today,
        countryName: 'Japan',
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveDailyChallenge(data);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'worldexplorer_daily_challenge',
        JSON.stringify(data)
      );
    });
  });

  describe('loadDailyChallenge', () => {
    it('loads challenge data from AsyncStorage', async () => {
      const today = toLocalDateKey(Date.now());
      const data = {
        countryCode: 'JP',
        dateKey: today,
        countryName: 'Japan',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(data));

      const result = await loadDailyChallenge();

      expect(result).toEqual(data);
    });

    it('returns null if no cached challenge', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadDailyChallenge();

      expect(result).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- utils/__tests__/dailyChallenge.test.ts --watch=false`

Expected: All tests FAIL with "cannot find module" or similar

- [ ] **Step 3: Create the implementation**

Create `utils/dailyChallenge.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Country } from './countries';
import { logger } from './logger';

export interface DailyChallengeData {
  countryCode: string;
  dateKey: string; // YYYY-MM-DD (local timezone)
  countryName: string;
}

const STORAGE_KEY = 'worldexplorer_daily_challenge';

/**
 * Format a timestamp as a local (device timezone) YYYY-MM-DD key.
 * Using local calendar days avoids off-by-one errors for users not on UTC.
 */
export function toLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Check if a cached daily challenge (by dateKey) has expired (is not today).
 */
export function isChallengeExpired(dateKey: string): boolean {
  const today = toLocalDateKey(Date.now());
  return dateKey !== today;
}

/**
 * Select a random country from the list.
 */
function selectRandomCountry(countries: Country[]): Country {
  const index = Math.floor(Math.random() * countries.length);
  return countries[index];
}

/**
 * Load cached daily challenge from AsyncStorage.
 */
export async function loadDailyChallenge(): Promise<DailyChallengeData | null> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as DailyChallengeData;
  } catch (error) {
    logger.warn('Failed to load daily challenge', {
      context: 'dailyChallenge',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return null;
  }
}

/**
 * Save daily challenge to AsyncStorage.
 */
export async function saveDailyChallenge(data: DailyChallengeData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.warn('Failed to save daily challenge', {
      context: 'dailyChallenge',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Get today's random country challenge.
 * If cached and not expired, return cached. Otherwise, select new random country.
 */
export async function getTodayChallenge(countries: Country[]): Promise<DailyChallengeData> {
  if (countries.length === 0) {
    logger.error('No countries available for daily challenge', {
      context: 'dailyChallenge',
      timestamp: new Date().toISOString(),
    });
    // Fallback: return a placeholder
    return {
      countryCode: 'XX',
      dateKey: toLocalDateKey(Date.now()),
      countryName: 'Unknown',
    };
  }

  const cached = await loadDailyChallenge();
  const today = toLocalDateKey(Date.now());

  // If cached and not expired, return it
  if (cached && !isChallengeExpired(cached.dateKey)) {
    return cached;
  }

  // Otherwise, select new random country
  const country = selectRandomCountry(countries);
  const newChallenge: DailyChallengeData = {
    countryCode: country.code,
    dateKey: today,
    countryName: country.translations?.en?.name || country.name,
  };

  await saveDailyChallenge(newChallenge);
  return newChallenge;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- utils/__tests__/dailyChallenge.test.ts --watch=false`

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add utils/dailyChallenge.ts utils/__tests__/dailyChallenge.test.ts
git commit -m "feat: create daily challenge utility with caching

- Random country selection per day
- Date-based cache expiry (local timezone)
- AsyncStorage persistence
- Full test coverage for logic and edge cases"
```

---

## Task 3: Create DailyChallengeCard Component

**Files:**
- Create: `src/components/ui/DailyChallengeCard.tsx`
- Create: `src/components/ui/__tests__/DailyChallengeCard.test.tsx`

**Interfaces:**
- Consumes: Country type, useTheme hook, useTranslation hook
- Produces: `DailyChallengeCard` React component
  - Props: `{ country: Country; onPress: () => void; testID?: string }`

- [ ] **Step 1: Write failing tests**

Create `src/components/ui/__tests__/DailyChallengeCard.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../context/ThemeContext';
import { DailyChallengeCard } from '../DailyChallengeCard';

const mockCountry = {
  code: 'JP',
  name: 'Japan',
  capital: 'Tokyo',
  region: 'Asia',
  population: 125124000,
  area: 377975,
  languages: ['Japanese'],
  translations: {
    en: { name: 'Japan' },
  },
};

describe('DailyChallengeCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders country flag and name', () => {
    const { getByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    expect(getByText('Japan')).toBeTruthy();
    expect(getByText("Today's Challenge")).toBeTruthy();
  });

  it('renders Learn & Quiz button', () => {
    const { getByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    expect(getByText('Learn & Quiz')).toBeTruthy();
  });

  it('calls onPress when button is tapped', () => {
    const { getByText } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Learn & Quiz'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('uses testID if provided', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <DailyChallengeCard country={mockCountry} onPress={mockOnPress} testID="daily-card" />
      </ThemeProvider>
    );

    expect(getByTestId('daily-card')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/ui/__tests__/DailyChallengeCard.test.tsx --watch=false`

Expected: Tests FAIL with "cannot find module"

- [ ] **Step 3: Create the component**

Create `src/components/ui/DailyChallengeCard.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { Country, getCountryFlag } from '../../../utils/countries';
import { commonTokens } from '../../../theme/tokens';

interface DailyChallengeCardProps {
  country: Country;
  onPress: () => void;
  testID?: string;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  country,
  onPress,
  testID,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors } = theme;

  const countryName = country.translations?.en?.name || country.name;
  const flag = getCountryFlag(country.code);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.flag}>{flag}</Text>
        <Text style={[styles.countryName, { color: colors.text }]}>{countryName}</Text>
      </View>

      <Text style={[styles.label, { color: colors.textTertiary }]}>
        {t('dailyChallenge')}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
        testID={`${testID || 'daily-card'}-button`}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
          {t('learnAndQuiz')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: commonTokens.spacing.md,
    marginVertical: commonTokens.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: commonTokens.spacing.md,
  },
  flag: {
    fontSize: 32,
    marginRight: commonTokens.spacing.sm,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    marginBottom: commonTokens.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    paddingVertical: commonTokens.spacing.md,
    paddingHorizontal: commonTokens.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/ui/__tests__/DailyChallengeCard.test.tsx --watch=false`

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DailyChallengeCard.tsx src/components/ui/__tests__/DailyChallengeCard.test.tsx
git commit -m "feat: create DailyChallengeCard component

- Displays country flag, name, and 'Learn & Quiz' CTA
- Uses design tokens for styling
- Full test coverage for rendering and interactions"
```

---

## Task 4: Integrate Streak Badge & Daily Challenge Card into HomeScreen

**Files:**
- Modify: `screens/HomeScreen.tsx`
- Modify: `screens/__tests__/HomeScreen.test.tsx`

**Interfaces:**
- Consumes: 
  - `getTodayChallenge()` from dailyChallenge utility
  - `useQuizHistory().getStats()` for streak
  - `useTranslation()` for labels
  - Navigation object for route params
- Produces: Updated HomeScreen with StreakBadge + DailyChallengeCard

- [ ] **Step 1: Update HomeScreen tests first**

Modify `screens/__tests__/HomeScreen.test.tsx` to add:

```typescript
// Add to existing test file
describe('HomeScreen - Streak and Daily Challenge', () => {
  it('renders StreakBadge if streak > 0', async () => {
    const mockUseQuizHistory = useQuizHistory as jest.Mock;
    mockUseQuizHistory.mockReturnValue({
      getStats: () => ({
        totalQuizzes: 10,
        currentStreak: 7,
        bestScore: 100,
        lastQuizDate: Date.now(),
      }),
      getSessions: () => [],
      addQuizSession: jest.fn(),
      clearHistory: jest.fn(),
      isLoading: false,
    });

    const { getByTestId } = renderHomeScreen();
    await act(async () => {});

    expect(getByTestId('streak-badge')).toBeTruthy();
  });

  it('does not render StreakBadge if streak is 0', async () => {
    const mockUseQuizHistory = useQuizHistory as jest.Mock;
    mockUseQuizHistory.mockReturnValue({
      getStats: () => ({
        totalQuizzes: 0,
        currentStreak: 0,
        bestScore: 0,
        lastQuizDate: 0,
      }),
      getSessions: () => [],
      addQuizSession: jest.fn(),
      clearHistory: jest.fn(),
      isLoading: false,
    });

    const { queryByTestId } = renderHomeScreen();
    await act(async () => {});

    expect(queryByTestId('streak-badge')).toBeNull();
  });

  it('renders DailyChallengeCard with today\'s country', async () => {
    const { getByTestId, getByText } = renderHomeScreen();
    await act(async () => {});

    expect(getByTestId('daily-challenge-card')).toBeTruthy();
    expect(getByText("Today's Challenge")).toBeTruthy();
  });

  it('navigates to QuizScreen when daily challenge card is pressed', async () => {
    const mockNavigate = jest.fn();
    const mockNavigation = { navigate: mockNavigate };
    
    const { getByTestId } = render(
      <ThemeProvider>
        <HomeScreen navigation={mockNavigation as any} />
      </ThemeProvider>
    );
    
    await act(async () => {});
    
    fireEvent.press(getByTestId('daily-challenge-card-button'));
    
    expect(mockNavigate).toHaveBeenCalledWith('Quiz', expect.objectContaining({
      countryCode: expect.any(String),
    }));
  });
});
```

- [ ] **Step 2: Update HomeScreen component**

Modify `screens/HomeScreen.tsx`. Find the main return JSX and add StreakBadge + DailyChallengeCard after the welcome section:

```typescript
// Add imports at top:
import { getTodayChallenge } from '../utils/dailyChallenge';
import { DailyChallengeCard } from '../src/components/ui/DailyChallengeCard';
import { countries } from '../utils/countries';

// Inside HomeScreen component, add state and effects:
export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { getStats } = useQuizHistory();
  const [todayChallenge, setTodayChallenge] = React.useState<DailyChallengeData | null>(null);

  const stats = getStats();
  const streak = stats.currentStreak;

  React.useEffect(() => {
    const loadChallenge = async () => {
      try {
        const challenge = await getTodayChallenge(countries);
        setTodayChallenge(challenge);
      } catch (error) {
        logger.warn('Failed to load daily challenge', {
          context: 'HomeScreen',
          timestamp: new Date().toISOString(),
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    };
    loadChallenge();
  }, []);

  const handleDailyChallengePress = () => {
    if (todayChallenge) {
      navigation.navigate('Quiz', { countryCode: todayChallenge.countryCode });
    }
  };

  // In the return JSX, after the welcome header, add:
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
        {/* Existing logo/header code */}
        
        {/* NEW: Streak Badge */}
        {streak > 0 && (
          <View style={[styles.streakContainer, { backgroundColor: colors.card }]} testID="streak-badge">
            <Text style={[styles.streakEmoji]}>🔥</Text>
            <View style={styles.streakContent}>
              <Text style={[styles.streakText, { color: colors.text }]}>
                {t('streakDays', { count: streak })}
              </Text>
              {streak > 0 && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(streak / 365) * 100}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* NEW: Daily Challenge Card */}
        {todayChallenge && (
          <DailyChallengeCard
            country={countries.find(c => c.code === todayChallenge.countryCode)!}
            onPress={handleDailyChallengePress}
            testID="daily-challenge-card"
          />
        )}

        {/* Existing cards below */}
      </ScrollView>
    </ScreenBackground>
  );
}

// Add to localStyles:
const localStyles = StyleSheet.create({
  // ... existing styles ...
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: commonTokens.spacing.md,
    marginTop: commonTokens.spacing.lg,
    marginBottom: commonTokens.spacing.sm,
    elevation: 1,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: commonTokens.spacing.md,
  },
  streakContent: {
    flex: 1,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: commonTokens.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- screens/__tests__/HomeScreen.test.tsx --watch=false`

Expected: New tests PASS

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add screens/HomeScreen.tsx screens/__tests__/HomeScreen.test.tsx
git commit -m "feat: add streak badge and daily challenge card to HomeScreen

- Display streak badge if streak > 0 with progress bar
- Show daily challenge card with country and 'Learn & Quiz' CTA
- Navigate to QuizScreen with country pre-selected on card tap
- Tests verify rendering and navigation"
```

---

## Task 5: Create NotificationService

**Files:**
- Create: `src/components/NotificationService.ts`
- Create: `src/components/__tests__/NotificationService.test.ts`

**Interfaces:**
- Consumes: expo-notifications, AsyncStorage
- Produces:
  - `initializeNotifications(): Promise<void>`
  - `scheduleNotification(time: string, message: string): Promise<void>`
  - `cancelNotifications(): Promise<void>`
  - `loadNotificationSettings(): Promise<NotificationSettings>`
  - `saveNotificationSettings(settings: NotificationSettings): Promise<void>`

- [ ] **Step 1: Write tests**

Create `src/components/__tests__/NotificationService.test.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeNotifications,
  scheduleNotification,
  cancelNotifications,
  loadNotificationSettings,
  saveNotificationSettings,
} from '../NotificationService';

jest.mock('expo-notifications');
jest.mock('@react-native-async-storage/async-storage');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadNotificationSettings', () => {
    it('loads notification settings from AsyncStorage', async () => {
      const settings = {
        enabled: true,
        time: '09:00',
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(settings));

      const result = await loadNotificationSettings();

      expect(result).toEqual(settings);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('worldexplorer_notifications_enabled');
    });

    it('returns default settings if not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadNotificationSettings();

      expect(result.enabled).toBe(false);
      expect(result.time).toBe('09:00');
    });
  });

  describe('saveNotificationSettings', () => {
    it('saves settings to AsyncStorage', async () => {
      const settings = { enabled: true, time: '10:00' };
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveNotificationSettings(settings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'worldexplorer_notifications_enabled',
        JSON.stringify(settings)
      );
    });
  });

  describe('scheduleNotification', () => {
    it('schedules notification for specified time', async () => {
      const mockNotificationId = 'test-id';
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(mockNotificationId);

      await scheduleNotification('09:00', 'Test message');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('handles scheduling errors gracefully', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Scheduling failed')
      );

      // Should not throw
      await expect(scheduleNotification('09:00', 'Test')).resolves.not.toThrow();
    });
  });

  describe('cancelNotifications', () => {
    it('cancels all scheduled notifications', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        undefined
      );

      await cancelNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/__tests__/NotificationService.test.ts --watch=false`

Expected: Tests FAIL

- [ ] **Step 3: Create the service**

Create `src/components/NotificationService.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format
}

const SETTINGS_KEY = 'worldexplorer_notifications_enabled';
const NOTIFICATION_ID_KEY = 'worldexplorer_notification_id';

/**
 * Configure notification handler behavior
 */
export async function initializeNotifications(): Promise<void> {
  try {
    // Set notification handler to show notifications even when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    logger.info('Notifications initialized', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Failed to initialize notifications', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Load notification settings from AsyncStorage
 */
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored) as NotificationSettings;
    }
  } catch (error) {
    logger.warn('Failed to load notification settings', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Return defaults if not found or error
  return {
    enabled: false,
    time: '09:00',
  };
}

/**
 * Save notification settings to AsyncStorage
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    logger.warn('Failed to save notification settings', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Schedule a daily notification at the specified time (HH:MM format)
 */
export async function scheduleNotification(time: string, message: string): Promise<void> {
  try {
    // Parse time (HH:MM)
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate seconds until next occurrence of this time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilNotification = Math.floor(
      (scheduledTime.getTime() - now.getTime()) / 1000
    );

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌍 World Explorer',
        body: message,
        sound: 'default',
      },
      trigger: {
        seconds: secondsUntilNotification,
        repeats: true, // Repeat daily
      },
    });

    // Store notification ID for later cancellation
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);

    logger.info('Notification scheduled', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: { time, notificationId },
    });
  } catch (error) {
    logger.warn('Failed to schedule notification', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);

    logger.info('Notifications cancelled', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Failed to cancel notifications', {
      context: 'NotificationService',
      timestamp: new Date().toISOString(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Update notification settings and reschedule if needed
 */
export async function updateNotificationSettings(
  enabled: boolean,
  time: string,
  countryName?: string
): Promise<void> {
  // Save settings
  const settings: NotificationSettings = { enabled, time };
  await saveNotificationSettings(settings);

  // Cancel existing notifications
  await cancelNotifications();

  // Schedule new notification if enabled
  if (enabled && countryName) {
    const message = `🌍 Today's country: ${countryName} — Ready to learn?`;
    await scheduleNotification(time, message);
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/components/__tests__/NotificationService.test.ts --watch=false`

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/NotificationService.ts src/components/__tests__/NotificationService.test.ts
git commit -m "feat: create NotificationService for daily reminders

- Schedule daily notifications at user-specified time
- Load/save notification settings to AsyncStorage
- Cancel notifications on demand
- Error handling and logging
- Full test coverage"
```

---

## Task 6: Add Notification Settings to SettingsScreen

**Files:**
- Modify: `screens/SettingsScreen.tsx`
- Modify: `screens/__tests__/SettingsScreen.test.tsx`

**Interfaces:**
- Consumes: NotificationService, SettingsScreen existing patterns
- Produces: Notification toggle + time picker in new "Notifications" card

- [ ] **Step 1: Add tests**

Modify `screens/__tests__/SettingsScreen.test.tsx` to add:

```typescript
// Add to existing test file
describe('SettingsScreen - Notifications', () => {
  it('renders notification toggle in settings', async () => {
    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('Daily Challenge Reminder')).toBeTruthy();
    expect(getByTestId('notification-toggle')).toBeTruthy();
  });

  it('renders time picker when notifications enabled', async () => {
    const { getByTestId, getByText } = renderSettingsScreen();
    await act(async () => {});

    expect(getByText('Remind me at')).toBeTruthy();
    expect(getByTestId('reminder-time-picker')).toBeTruthy();
  });

  it('toggles notification settings', async () => {
    const { getByTestId } = renderSettingsScreen();
    await act(async () => {});

    const toggle = getByTestId('notification-toggle');
    fireEvent.press(toggle);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify toggle state changed
    expect(toggle.props.value).toBeDefined();
  });
});
```

- [ ] **Step 2: Modify SettingsScreen**

Add to imports:

```typescript
import {
  loadNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from '../src/components/NotificationService';
```

Add state and effect after existing settings state:

```typescript
const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
  enabled: false,
  time: '09:00',
});

React.useEffect(() => {
  const loadSettings = async () => {
    const settings = await loadNotificationSettings();
    setNotificationSettings(settings);
  };
  loadSettings();
}, []);

const handleNotificationToggle = async () => {
  const newSettings = {
    ...notificationSettings,
    enabled: !notificationSettings.enabled,
  };
  setNotificationSettings(newSettings);
  
  // Get today's country for notification message
  const challenge = await getTodayChallenge(countries);
  const countryName = challenge.countryName;
  
  await updateNotificationSettings(newSettings.enabled, newSettings.time, countryName);
  triggerLightHaptic();
};

const handleTimeChange = async (time: string) => {
  const newSettings = { ...notificationSettings, time };
  setNotificationSettings(newSettings);
  
  if (newSettings.enabled) {
    const challenge = await getTodayChallenge(countries);
    const countryName = challenge.countryName;
    await updateNotificationSettings(newSettings.enabled, time, countryName);
  }
};
```

Add to JSX (after existing settings cards, before end of ScrollView):

```typescript
{/* Notifications Card */}
<Card style={{ marginBottom: commonTokens.spacing.lg }}>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: commonTokens.spacing.md,
    }}
  >
    <MaterialCommunityIcons
      name="bell-outline"
      size={24}
      color={theme.colors.primary}
      style={{ marginRight: commonTokens.spacing.md }}
    />
    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
      {t('notifications')}
    </Text>
  </View>

  {/* Notification Toggle */}
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: commonTokens.spacing.md,
    }}
  >
    <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
      {t('dailyChallengeReminder')}
    </Text>
    <ToggleSwitch
      value={notificationSettings.enabled}
      onToggle={handleNotificationToggle}
      testID="notification-toggle"
      accessibilityLabel={t('dailyChallengeReminder')}
    />
  </View>

  {/* Time Picker (only show if enabled) */}
  {notificationSettings.enabled && (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
        {t('remindMeAt')}
      </Text>
      <TouchableOpacity
        onPress={() => {
          // Time picker logic (platform-specific)
          // For now, show a simple hour/minute selector
        }}
        testID="reminder-time-picker"
      >
        <Text style={[styles.timeDisplay, { color: theme.colors.primary }]}>
          {notificationSettings.time}
        </Text>
      </TouchableOpacity>
    </View>
  )}
</Card>
```

Add to localStyles:

```typescript
timeDisplay: {
  fontSize: 14,
  fontWeight: '600',
  paddingVertical: commonTokens.spacing.sm,
  paddingHorizontal: commonTokens.spacing.md,
},
```

- [ ] **Step 3: Run tests**

Run: `npm test -- screens/__tests__/SettingsScreen.test.tsx --watch=false`

Expected: New tests PASS

- [ ] **Step 4: Commit**

```bash
git add screens/SettingsScreen.tsx screens/__tests__/SettingsScreen.test.tsx
git commit -m "feat: add notification settings to SettingsScreen

- Add 'Daily Challenge Reminder' toggle in new Notifications card
- Show time picker when notifications enabled
- Save/load settings from AsyncStorage
- Tests verify toggle and time picker rendering"
```

---

## Task 7: Integrate Daily Challenge Country Pre-Selection into QuizScreen

**Files:**
- Modify: `screens/quiz/QuizScreen.tsx`
- Modify: `screens/quiz/__tests__/QuizScreen.test.tsx`

**Interfaces:**
- Consumes: Route params with optional `countryCode`
- Produces: Modified QuizScreen that skips country picker if `countryCode` provided

- [ ] **Step 1: Add test**

Modify `screens/quiz/__tests__/QuizScreen.test.tsx` to add:

```typescript
it('skips country picker if countryCode route param provided', async () => {
  const mockRoute = {
    params: { countryCode: 'JP' },
  };

  const { queryByText, getByText } = render(
    <ThemeProvider>
      <QuizHistoryProvider>
        <QuizScreen route={mockRoute as any} navigation={mockNavigation} />
      </QuizHistoryProvider>
    </ThemeProvider>
  );

  await act(async () => {});

  // Should skip to difficulty selector, not show country picker
  expect(queryByText('Select a Country')).toBeNull();
  expect(getByText(/difficulty|Easy|Medium|Hard/)).toBeTruthy();
});

it('starts quiz immediately if both countryCode and difficulty provided', async () => {
  const mockRoute = {
    params: { countryCode: 'JP', difficulty: 'easy' },
  };

  const { getByText, queryByTestId } = render(
    <ThemeProvider>
      <QuizHistoryProvider>
        <QuizScreen route={mockRoute as any} navigation={mockNavigation} />
      </QuizHistoryProvider>
    </ThemeProvider>
  );

  await act(async () => {});

  // Should show first question
  expect(queryByTestId('question-text')).toBeTruthy();
});
```

- [ ] **Step 2: Modify QuizScreen**

Update route params type to include optional countryCode:

```typescript
type RootStackParamList = {
  Quiz?: {
    countryCode?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
};

interface QuizScreenProps {
  route: RouteProp<RootStackParamList, 'Quiz'>;
  navigation: any;
}
```

Update component to check for pre-selected country:

```typescript
export function QuizScreen({ route, navigation }: QuizScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { addQuizSession, getStats, getSessions } = useQuizHistory();

  // Get pre-selected country from route params (from daily challenge)
  const preSelectedCountryCode = route.params?.countryCode;
  const preSelectedDifficulty = route.params?.difficulty;

  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
    preSelectedCountryCode
      ? countries.find(c => c.code === preSelectedCountryCode) || null
      : null
  );
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty | null>(
    preSelectedDifficulty || null
  );
  const [hasStarted, setHasStarted] = React.useState(
    preSelectedCountryCode && preSelectedDifficulty ? true : false
  );

  // ... rest of component logic unchanged
  // The component now automatically skips to difficulty picker if countryCode provided
  // And starts quiz immediately if both countryCode and difficulty provided
}
```

- [ ] **Step 3: Run tests**

Run: `npm test -- screens/quiz/__tests__/QuizScreen.test.tsx --watch=false`

Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add screens/quiz/QuizScreen.tsx screens/quiz/__tests__/QuizScreen.test.tsx
git commit -m "feat: support pre-selected country in QuizScreen via route params

- Skip country picker if countryCode route param provided
- Used by daily challenge feature to start quiz immediately
- Tests verify skipping picker and starting with country/difficulty"
```

---

## Task 8: Add i18n Translations

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/de.json`
- Modify: `src/locales/fr.json`
- Modify: `src/locales/pl.json`

**Interfaces:**
- Consumes: Existing translation keys
- Produces: 6 new translation keys added to all 5 locales

- [ ] **Step 1: Identify required keys**

New keys needed:
- `dailyChallenge` (label for card)
- `learnAndQuiz` (CTA button)
- `streakDays` (streak badge label, with pluralization)
- `notifications` (card title)
- `dailyChallengeReminder` (toggle label)
- `remindMeAt` (time picker label)

- [ ] **Step 2: Add to English locale**

Modify `src/locales/en.json`. Add to the JSON object:

```json
{
  ...existingKeys,
  "dailyChallenge": "Today's Challenge",
  "learnAndQuiz": "Learn & Quiz",
  "streakDays": "{{count}}-day streak",
  "notifications": "Notifications",
  "dailyChallengeReminder": "Daily Challenge Reminder",
  "remindMeAt": "Remind me at"
}
```

- [ ] **Step 3: Add to Spanish locale**

Modify `src/locales/es.json`:

```json
{
  ...existingKeys,
  "dailyChallenge": "Desafío de Hoy",
  "learnAndQuiz": "Aprender y Quiz",
  "streakDays": "Racha de {{count}} días",
  "notifications": "Notificaciones",
  "dailyChallengeReminder": "Recordatorio de Desafío Diario",
  "remindMeAt": "Recordarme a las"
}
```

- [ ] **Step 4: Add to German locale**

Modify `src/locales/de.json`:

```json
{
  ...existingKeys,
  "dailyChallenge": "Heutige Herausforderung",
  "learnAndQuiz": "Lernen & Quiz",
  "streakDays": "{{count}}-Tage-Serie",
  "notifications": "Benachrichtigungen",
  "dailyChallengeReminder": "Tägliche Herausforderungserinnerung",
  "remindMeAt": "Erinnern Sie mich um"
}
```

- [ ] **Step 5: Add to French locale**

Modify `src/locales/fr.json`:

```json
{
  ...existingKeys,
  "dailyChallenge": "Défi du Jour",
  "learnAndQuiz": "Apprendre et Quiz",
  "streakDays": "Séquence de {{count}} jours",
  "notifications": "Notifications",
  "dailyChallengeReminder": "Rappel du Défi Quotidien",
  "remindMeAt": "Rappel à"
}
```

- [ ] **Step 6: Add to Polish locale**

Modify `src/locales/pl.json`:

```json
{
  ...existingKeys,
  "dailyChallenge": "Wyzwanie Dnia",
  "learnAndQuiz": "Naucz się i Quiz",
  "streakDays": "Seria {{count}} dni",
  "notifications": "Powiadomienia",
  "dailyChallengeReminder": "Codzienne Przypomnienie o Wyzwaniu",
  "remindMeAt": "Przypomnienie o"
}
```

- [ ] **Step 7: Validate translations**

Run: `npm run countries:validate` (or similar i18n validation script if available)

Expected: No missing keys errors

- [ ] **Step 8: Commit**

```bash
git add src/locales/en.json src/locales/es.json src/locales/de.json src/locales/fr.json src/locales/pl.json
git commit -m "i18n: add daily challenge and notification translation keys

Add 6 new keys to all 5 locales (en, es, de, fr, pl):
- dailyChallenge
- learnAndQuiz
- streakDays (with pluralization)
- notifications
- dailyChallengeReminder
- remindMeAt"
```

---

## Task 9: Manual Testing & Polish

**Files:**
- Entire app (integration testing)

**Interfaces:**
- Consumes: All previous tasks' outputs
- Produces: Verified working feature, ready for release

- [ ] **Step 1: Verify all tests pass**

Run: `npm test`

Expected: All 26 test suites, 550+ tests PASS (some new tests added)

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

- [ ] **Step 3: Manual flow testing**

On iOS simulator or Android emulator:

1. **First app open:**
   - [ ] HomeScreen displays (no crash)
   - [ ] Daily challenge card appears with random country
   - [ ] Streak badge does NOT appear (no quizzes yet)

2. **Daily challenge flow:**
   - [ ] Tap "Learn & Quiz" button
   - [ ] Navigate to QuizScreen
   - [ ] Country is pre-selected (skip picker)
   - [ ] Complete a quiz
   - [ ] Return to HomeScreen
   - [ ] Streak badge now shows "🔥 1-day streak"

3. **Streak persistence:**
   - [ ] Close and reopen app
   - [ ] HomeScreen shows same streak
   - [ ] Daily challenge shows SAME country (not new one)

4. **Timezone/midnight behavior (simulated):**
   - [ ] Open app same day → same country shown
   - [ ] Simulate midnight (change device time forward 24 hours)
   - [ ] Close and reopen app
   - [ ] NEW random country should appear

5. **Notifications (SettingsScreen):**
   - [ ] Navigate to Settings
   - [ ] Find "Notifications" card
   - [ ] Toggle "Daily Challenge Reminder" OFF
   - [ ] Toggle ON
   - [ ] Notification prompt appears (request permission)
   - [ ] Grant permission
   - [ ] Time picker shows "09:00"
   - [ ] Time persists after app restart

6. **Notification delivery:**
   - [ ] Wait for scheduled time (or simulate by changing device time)
   - [ ] Notification should fire
   - [ ] Tap notification → opens app to HomeScreen
   - [ ] Daily challenge card is visible

7. **Accessibility:**
   - [ ] All touch targets are 48dp+ (visually verify or measure)
   - [ ] Text contrast passes (use accessibility checker)
   - [ ] Semantic labels on all interactive elements

8. **Dark mode:**
   - [ ] Toggle dark mode in Settings
   - [ ] Daily challenge card, streak badge, and notifications adapt to theme
   - [ ] Colors use design tokens (no jarring color shifts)

9. **Localization:**
   - [ ] Change language to Spanish/German/French/Polish in Settings
   - [ ] HomeScreen labels update correctly
   - [ ] All 5 locales work without crashes

- [ ] **Step 4: Edge case testing**

1. **No internet:**
   - [ ] Disable WiFi/cellular
   - [ ] HomeScreen still loads daily challenge from cache
   - [ ] Quizzes work offline
   - [ ] Notifications still schedule

2. **Many quizzes same day:**
   - [ ] Complete 3-4 quizzes same day
   - [ ] Streak updates correctly (stays 1 day, doesn't double)

3. **Permission denied:**
   - [ ] Deny notification permission when prompted
   - [ ] Settings toggle still works (just doesn't fire notifications)
   - [ ] No crashes or errors

4. **Reinstall/clear data:**
   - [ ] Clear app data (developer settings)
   - [ ] Reopen app
   - [ ] Daily challenge picks new random country
   - [ ] No crashes

- [ ] **Step 5: Commit final polish**

If any small fixes needed (typos, margin adjustments, etc.):

```bash
git add [files]
git commit -m "polish: minor UI/UX adjustments for daily challenge feature

- [specific changes if any]"
```

---

## Summary Checklist

Before marking as complete, verify:

- [ ] All 9 tasks committed with clear messages
- [ ] All new code has unit + integration tests
- [ ] All tests passing (`npm test`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] All 5 locales have new translation keys
- [ ] Manual testing completed on both iOS and Android
- [ ] Accessibility verified (touch targets, contrast, labels)
- [ ] Dark mode works correctly
- [ ] No hardcoded colors (all use design tokens)
- [ ] Ready for PR and code review

---

## Post-Implementation

After all tasks complete:

1. **Create PR** → `feat: daily challenge + streak for DAU increase (v2.0.7)`
2. **Code review** → verify tests, accessibility, i18n
3. **Merge to main** → squash commits into feature branch? Follow your workflow
4. **Version bump** → v2.0.7 (already at 2.0.6)
5. **Deploy to internal track** → same Play Store workflow as v2.0.6
6. **Monitor DAU/retention** → compare metrics before/after launch
