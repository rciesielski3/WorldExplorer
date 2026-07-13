import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export interface DailyChallengeData {
  countryCode: string;
  dateKey: string; // YYYY-MM-DD (local timezone)
  countryName: string;
}

/**
 * Minimal country shape required to select a daily challenge.
 * A narrow structural type (rather than the full `Country` type from
 * `./countries`) keeps this module easy to test with lightweight fixtures
 * while remaining fully compatible with real `Country` objects, whose
 * display name lives at `translations.en.name`.
 */
export interface ChallengeCountry {
  code: string;
  name?: string;
  translations?: {
    en?: { name?: string };
  };
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
function selectRandomCountry(countries: ChallengeCountry[]): ChallengeCountry {
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
export async function getTodayChallenge(countries: ChallengeCountry[]): Promise<DailyChallengeData> {
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
    countryName: country.translations?.en?.name || country.name || country.code,
  };

  await saveDailyChallenge(newChallenge);
  return newChallenge;
}
