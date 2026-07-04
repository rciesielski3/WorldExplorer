import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase-config';
import { collection, doc, getDoc } from 'firebase/firestore';
import { logger } from './logger';

export interface HistoricalFact {
  countryCode: string;
  facts: string[];
  lastUpdated: number;
}

const FACTS_CACHE_KEY = 'worldexplorer_facts_cache';

export const fetchHistoricalFacts = async (
  countryCode: string
): Promise<string[]> => {
  try {
    // Try Firebase first (if network available)
    try {
      const docRef = doc(db, 'countries', countryCode, 'facts', 'data');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const facts = docSnap.data().facts || [];
        // Cache to AsyncStorage
        await cacheFactsLocally(countryCode, facts);
        return facts;
      }
    } catch (error) {
      logger.warn('Firebase facts fetch failed, falling back to cache', {
        context: 'historicalFacts',
        timestamp: new Date().toISOString(),
        metadata: { countryCode },
      });
    }

    // Fall back to AsyncStorage cache
    const cached = await getFactsFromCache(countryCode);
    return cached || [];
  } catch (error) {
    logger.error('Failed to fetch historical facts', {
      context: 'historicalFacts',
      timestamp: new Date().toISOString(),
      metadata: {
        countryCode,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return [];
  }
};

const cacheFactsLocally = async (
  countryCode: string,
  facts: string[]
): Promise<void> => {
  const cache = (await AsyncStorage.getItem(FACTS_CACHE_KEY)) || '{}';
  const parsed = JSON.parse(cache);
  parsed[countryCode] = {
    facts,
    cachedAt: Date.now(),
  };
  await AsyncStorage.setItem(FACTS_CACHE_KEY, JSON.stringify(parsed));
};

const getFactsFromCache = async (countryCode: string): Promise<string[] | null> => {
  const cache = (await AsyncStorage.getItem(FACTS_CACHE_KEY)) || '{}';
  const parsed = JSON.parse(cache);
  return parsed[countryCode]?.facts || null;
};

export const preloadAllFacts = async (countryCodes: string[]): Promise<void> => {
  for (const code of countryCodes) {
    await fetchHistoricalFacts(code);
  }
};
