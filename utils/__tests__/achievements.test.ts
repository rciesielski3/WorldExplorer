import { checkAchievementUnlock, ACHIEVEMENTS } from '../achievements';
import { QuizSession } from '../../context/QuizHistoryContext';

const DAY_MS = 1000 * 60 * 60 * 24;

function makeSession(overrides: Partial<QuizSession>): QuizSession {
  return {
    id: 'session-id',
    timestamp: Date.now(),
    difficulty: 'medium',
    score: 50,
    timeTaken: 60,
    ...overrides,
  };
}

describe('ACHIEVEMENTS', () => {
  it('defines exactly the 4 MVP achievements with expected shape', () => {
    expect(ACHIEVEMENTS).toEqual([
      {
        id: 'first_quiz',
        labelKey: 'achievement_first_quiz',
        descriptionKey: 'achievement_first_quiz_desc',
        icon: '🎯',
      },
      {
        id: 'on_fire',
        labelKey: 'achievement_on_fire',
        descriptionKey: 'achievement_on_fire_desc',
        icon: '🔥',
      },
      {
        id: 'country_master',
        labelKey: 'achievement_country_master',
        descriptionKey: 'achievement_country_master_desc',
        icon: '🌍',
      },
      {
        id: 'improver',
        labelKey: 'achievement_improver',
        descriptionKey: 'achievement_improver_desc',
        icon: '📈',
      },
    ]);
  });
});

describe('checkAchievementUnlock', () => {
  it('unlocks first_quiz when the session list contains only the new session', () => {
    const newSession = makeSession({ id: 'a' });
    const unlocked = checkAchievementUnlock(newSession, [newSession]);

    expect(unlocked).toContain('first_quiz');
  });

  it('does not unlock first_quiz when prior sessions already exist', () => {
    const previous = makeSession({ id: 'a', timestamp: Date.now() - DAY_MS });
    const newSession = makeSession({ id: 'b' });
    const unlocked = checkAchievementUnlock(newSession, [previous, newSession]);

    expect(unlocked).not.toContain('first_quiz');
  });

  it('unlocks on_fire when the session extends a 3-day consecutive streak', () => {
    const now = Date.now();
    const dayMinus2 = makeSession({ id: 'a', timestamp: now - 2 * DAY_MS });
    const dayMinus1 = makeSession({ id: 'b', timestamp: now - 1 * DAY_MS });
    const today = makeSession({ id: 'c', timestamp: now });

    const unlocked = checkAchievementUnlock(today, [dayMinus2, dayMinus1, today]);

    expect(unlocked).toContain('on_fire');
  });

  it('does not unlock on_fire when the streak is shorter than 3 days', () => {
    const now = Date.now();
    const dayMinus1 = makeSession({ id: 'a', timestamp: now - 1 * DAY_MS });
    const today = makeSession({ id: 'b', timestamp: now });

    const unlocked = checkAchievementUnlock(today, [dayMinus1, today]);

    expect(unlocked).not.toContain('on_fire');
  });

  it('unlocks country_master on a 100% hard-difficulty score', () => {
    const newSession = makeSession({ difficulty: 'hard', score: 100 });
    const unlocked = checkAchievementUnlock(newSession, [newSession]);

    expect(unlocked).toContain('country_master');
  });

  it('does not unlock country_master on a 100% easy-difficulty score', () => {
    const newSession = makeSession({ difficulty: 'easy', score: 100 });
    const unlocked = checkAchievementUnlock(newSession, [newSession]);

    expect(unlocked).not.toContain('country_master');
  });

  it('unlocks improver when score is 20+ points higher than the previous session', () => {
    const previous = makeSession({ id: 'a', score: 50, timestamp: Date.now() - DAY_MS });
    const newSession = makeSession({ id: 'b', score: 75, timestamp: Date.now() });

    const unlocked = checkAchievementUnlock(newSession, [previous, newSession]);

    expect(unlocked).toContain('improver');
  });

  it('does not unlock improver when the score gain is under 20 points', () => {
    const previous = makeSession({ id: 'a', score: 50, timestamp: Date.now() - DAY_MS });
    const newSession = makeSession({ id: 'b', score: 65, timestamp: Date.now() });

    const unlocked = checkAchievementUnlock(newSession, [previous, newSession]);

    expect(unlocked).not.toContain('improver');
  });

  it('does not unlock improver on the first session (no previous session to compare)', () => {
    const newSession = makeSession({ id: 'a', score: 90 });

    const unlocked = checkAchievementUnlock(newSession, [newSession]);

    expect(unlocked).not.toContain('improver');
  });

  it('returns an empty array and does not mutate input when no conditions are met', () => {
    const previous = makeSession({ id: 'a', score: 50, timestamp: Date.now() - DAY_MS });
    const newSession = makeSession({ id: 'b', score: 55, difficulty: 'easy', timestamp: Date.now() });
    const allSessions = [previous, newSession];
    const snapshot = [...allSessions];

    const unlocked = checkAchievementUnlock(newSession, allSessions);

    expect(unlocked).toEqual([]);
    expect(allSessions).toEqual(snapshot);
  });

  it('handles an empty sessions array without throwing', () => {
    const newSession = makeSession({ id: 'a' });

    expect(() => checkAchievementUnlock(newSession, [])).not.toThrow();
  });
});
