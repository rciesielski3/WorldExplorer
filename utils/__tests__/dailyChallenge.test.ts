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
