import { QuizSession } from '../context/QuizHistoryContext';

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

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Calculate the number of consecutive days (ending on the most recent
 * session's day) that contain at least one quiz session.
 *
 * Does not mutate the input array.
 */
function calculateStreak(sessions: QuizSession[]): number {
  if (sessions.length === 0) return 0;

  const uniqueDayKeys = new Set<number>();
  for (const session of sessions) {
    uniqueDayKeys.add(Math.floor(session.timestamp / DAY_MS));
  }

  const sortedDays = Array.from(uniqueDayKeys).sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i - 1] - sortedDays[i] === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

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
