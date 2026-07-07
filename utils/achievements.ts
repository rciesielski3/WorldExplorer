import { QuizSession, calculateStreak } from '../context/QuizHistoryContext';

export interface Achievement {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    labelKey: 'achievementFirstQuiz',
    descriptionKey: 'achievementFirstQuizDesc',
    icon: '🎯',
  },
  {
    id: 'on_fire',
    labelKey: 'achievementOnFire',
    descriptionKey: 'achievementOnFireDesc',
    icon: '🔥',
  },
  {
    id: 'country_master',
    labelKey: 'achievementCountryMaster',
    descriptionKey: 'achievementCountryMasterDesc',
    icon: '🌍',
  },
  {
    id: 'improver',
    labelKey: 'achievementImprover',
    descriptionKey: 'achievementImproverDesc',
    icon: '📈',
  },
];

/**
 * Determine which achievements the newly-completed session unlocks.
 *
 * `allSessions` must include `newSession` as its last element (this mirrors
 * how the caller appends a session to history before checking unlocks).
 * Pure function: does not mutate `allSessions`.
 */
export function checkAchievementUnlock(
  newSession: QuizSession,
  allSessions: QuizSession[]
): string[] {
  const unlocked: string[] = [];

  if (allSessions.length === 1) {
    unlocked.push('first_quiz');
  }

  if (calculateStreak(allSessions) >= 3) {
    unlocked.push('on_fire');
  }

  if (newSession.difficulty === 'hard' && newSession.score >= 100) {
    unlocked.push('country_master');
  }

  const previousSession = allSessions[allSessions.length - 2];
  if (previousSession && newSession.score - previousSession.score >= 20) {
    unlocked.push('improver');
  }

  return unlocked;
}
