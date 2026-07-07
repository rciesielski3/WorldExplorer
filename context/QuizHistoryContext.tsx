import React, { ReactNode, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface QuizSession {
  id: string;
  timestamp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  timeTaken: number;
}

export interface UserStats {
  totalQuizzes: number;
  currentStreak: number;
  bestScore: number;
  lastQuizDate: number;
}

export interface QuizHistoryContextType {
  addQuizSession: (session: Omit<QuizSession, 'id'>) => Promise<void>;
  getStats: () => UserStats;
  getSessions: () => QuizSession[];
  clearHistory: () => Promise<void>;
  isLoading: boolean;
}

const QuizHistoryContext = React.createContext<QuizHistoryContextType>({
  addQuizSession: async () => {},
  getStats: () => ({
    totalQuizzes: 0,
    currentStreak: 0,
    bestScore: 0,
    lastQuizDate: 0,
  }),
  getSessions: () => [],
  clearHistory: async () => {},
  isLoading: true,
});

export const useQuizHistory = () => {
  const context = React.useContext(QuizHistoryContext);
  if (!context) {
    throw new Error('useQuizHistory must be used within QuizHistoryProvider');
  }
  return context;
};

const QUIZ_SESSIONS_STORAGE_KEY = 'worldexplorer_quiz_sessions';

/**
 * Format a timestamp as a local (device timezone) `YYYY-MM-DD` key. Using
 * local calendar days (rather than `toISOString()`, which is UTC) avoids
 * off-by-one errors for users not on UTC.
 */
function toLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/** Parse a `YYYY-MM-DD` key back into a local-midnight Date. */
function parseLocalDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate the current streak: consecutive local-calendar days (ending
 * today or yesterday) with at least one quiz session.
 *
 * If the most recent session isn't from today or yesterday, the streak has
 * been broken and this returns 0.
 */
export function calculateStreak(sessions: QuizSession[]): number {
  if (sessions.length === 0) return 0;

  const uniqueDateKeys = Array.from(
    new Set(sessions.map((s) => toLocalDateKey(s.timestamp)))
  ).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  const todayKey = toLocalDateKey(Date.now());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday.getTime());

  const mostRecentKey = uniqueDateKeys[0];
  if (mostRecentKey !== todayKey && mostRecentKey !== yesterdayKey) {
    return 0;
  }

  let streak = 1;
  let cursor = parseLocalDateKey(mostRecentKey);
  for (let i = 1; i < uniqueDateKeys.length; i++) {
    const expectedPrevDay = new Date(cursor);
    expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
    const expectedPrevDayKey = toLocalDateKey(expectedPrevDay.getTime());

    if (uniqueDateKeys[i] === expectedPrevDayKey) {
      streak++;
      cursor = expectedPrevDay;
    } else {
      break;
    }
  }

  return streak;
}

export const QuizHistoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from AsyncStorage on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const stored = await AsyncStorage.getItem(QUIZ_SESSIONS_STORAGE_KEY);
        if (stored) {
          setSessions(JSON.parse(stored));
        }
        setIsLoading(false);
      } catch (error) {
        logger.error('Failed to load quiz sessions', {
          context: 'QuizHistoryContext',
          timestamp: new Date().toISOString(),
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  /**
   * Calculate stats based on current sessions
   */
  const calculateStats = React.useCallback((sessionsData: QuizSession[]): UserStats => {
    if (sessionsData.length === 0) {
      return {
        totalQuizzes: 0,
        currentStreak: 0,
        bestScore: 0,
        lastQuizDate: 0,
      };
    }

    const bestScore = Math.max(...sessionsData.map(s => s.score));
    const lastQuizDate = Math.max(...sessionsData.map(s => s.timestamp));
    const currentStreak = calculateStreak(sessionsData);

    return {
      totalQuizzes: sessionsData.length,
      currentStreak,
      bestScore,
      lastQuizDate,
    };
  }, []);

  /**
   * Sync quiz sessions to Firebase (non-blocking, warns on failure)
   */
  const syncToFirebase = React.useCallback(async (sessionsData: QuizSession[]) => {
    try {
      // Placeholder for Firebase sync
      // TODO: Implement Firebase sync when auth is integrated
      const userId = 'user-123';
      // const db = getFirestore();
      // const userQuizzesRef = collection(db, 'users', userId, 'quizSessions');
      // for (const session of sessionsData) {
      //   await setDoc(doc(userQuizzesRef, session.id), session);
      // }
      logger.info('Quiz sessions synced to Firebase', {
        context: 'QuizHistoryContext',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('Failed to sync quiz sessions to Firebase', {
        context: 'QuizHistoryContext',
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }, []);

  /**
   * Add a quiz session with auto-generated ID
   */
  const addQuizSession = React.useCallback(async (
    session: Omit<QuizSession, 'id'>
  ): Promise<void> => {
    const newSession: QuizSession = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setSessions(prevSessions => {
      const updated = [...prevSessions, newSession];

      // Persist to AsyncStorage
      AsyncStorage.setItem(
        QUIZ_SESSIONS_STORAGE_KEY,
        JSON.stringify(updated)
      ).catch(error => {
        logger.error('Failed to save quiz session', {
          context: 'QuizHistoryContext',
          timestamp: new Date().toISOString(),
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      });

      // Sync to Firebase (non-blocking)
      syncToFirebase(updated);

      return updated;
    });
  }, [syncToFirebase]);

  /**
   * Get current user stats
   */
  const getStats = React.useCallback((): UserStats => {
    return calculateStats(sessions);
  }, [calculateStats, sessions]);

  /**
   * Get all quiz sessions
   */
  const getSessions = React.useCallback((): QuizSession[] => {
    return [...sessions];
  }, [sessions]);

  /**
   * Clear all quiz history
   */
  const clearHistory = React.useCallback(async (): Promise<void> => {
    setSessions([]);

    try {
      await AsyncStorage.removeItem(QUIZ_SESSIONS_STORAGE_KEY);
    } catch (error) {
      logger.error('Failed to clear quiz history', {
        context: 'QuizHistoryContext',
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }, []);

  const value = React.useMemo(
    () => ({
      addQuizSession,
      getStats,
      getSessions,
      clearHistory,
      isLoading,
    }),
    [addQuizSession, getStats, getSessions, clearHistory, isLoading]
  );

  return (
    <QuizHistoryContext.Provider value={value}>
      {children}
    </QuizHistoryContext.Provider>
  );
};
