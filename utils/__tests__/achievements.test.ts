import { checkAchievementUnlock, ACHIEVEMENTS } from '../achievements';
import { QuizSession } from '../../context/QuizHistoryContext';

const DAY_MS = 1000 * 60 * 60 * 24;

function sessionAt(
  timestamp: number,
  overrides: Partial<Omit<QuizSession, 'id' | 'timestamp'>> = {}
): QuizSession {
  return {
    id: `session-${timestamp}`,
    timestamp,
    difficulty: 'easy',
    score: 80,
    timeTaken: 30,
    ...overrides,
  };
}

describe('ACHIEVEMENTS', () => {
  it('defines exactly the 4 MVP achievements with required fields', () => {
    expect(ACHIEVEMENTS).toHaveLength(4);
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toEqual([
      'first_quiz',
      'on_fire',
      'country_master',
      'improver',
    ]);

    ACHIEVEMENTS.forEach((achievement) => {
      expect(achievement.labelKey).toBeTruthy();
      expect(achievement.descriptionKey).toBeTruthy();
      expect(achievement.icon).toBeTruthy();
    });
  });
});

describe('checkAchievementUnlock', () => {
  const NOW = new Date(2026, 5, 15, 12, 0, 0).getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('unlocks first_quiz on the very first session', () => {
    const first = sessionAt(NOW);
    const unlocked = checkAchievementUnlock(first, [first]);
    expect(unlocked).toContain('first_quiz');
  });

  it('does not unlock first_quiz on subsequent sessions', () => {
    const first = sessionAt(NOW - DAY_MS);
    const second = sessionAt(NOW);
    const unlocked = checkAchievementUnlock(second, [first, second]);
    expect(unlocked).not.toContain('first_quiz');
  });

  it('unlocks on_fire once the streak reaches 3 consecutive days', () => {
    const sessions = [
      sessionAt(NOW - 2 * DAY_MS),
      sessionAt(NOW - DAY_MS),
      sessionAt(NOW),
    ];
    const unlocked = checkAchievementUnlock(sessions[sessions.length - 1], sessions);
    expect(unlocked).toContain('on_fire');
  });

  it('does not unlock on_fire when the streak is broken by a gap', () => {
    const sessions = [
      sessionAt(NOW - 5 * DAY_MS),
      sessionAt(NOW - 4 * DAY_MS),
      sessionAt(NOW),
    ];
    const unlocked = checkAchievementUnlock(sessions[sessions.length - 1], sessions);
    expect(unlocked).not.toContain('on_fire');
  });

  it('unlocks country_master for a perfect hard-difficulty score', () => {
    const session = sessionAt(NOW, { difficulty: 'hard', score: 100 });
    const unlocked = checkAchievementUnlock(session, [session]);
    expect(unlocked).toContain('country_master');
  });

  it('does not unlock country_master for a non-perfect hard score', () => {
    const session = sessionAt(NOW, { difficulty: 'hard', score: 90 });
    const unlocked = checkAchievementUnlock(session, [session]);
    expect(unlocked).not.toContain('country_master');
  });

  it('does not unlock country_master for a perfect score on easy/medium', () => {
    const session = sessionAt(NOW, { difficulty: 'easy', score: 100 });
    const unlocked = checkAchievementUnlock(session, [session]);
    expect(unlocked).not.toContain('country_master');
  });

  it('unlocks improver when score improves by at least 20 points over the previous session', () => {
    const previous = sessionAt(NOW - DAY_MS, { score: 60 });
    const current = sessionAt(NOW, { score: 85 });
    const unlocked = checkAchievementUnlock(current, [previous, current]);
    expect(unlocked).toContain('improver');
  });

  it('does not unlock improver for a smaller improvement', () => {
    const previous = sessionAt(NOW - DAY_MS, { score: 60 });
    const current = sessionAt(NOW, { score: 70 });
    const unlocked = checkAchievementUnlock(current, [previous, current]);
    expect(unlocked).not.toContain('improver');
  });

  it('does not mutate the sessions array', () => {
    const sessions = [sessionAt(NOW - DAY_MS), sessionAt(NOW)];
    const copy = [...sessions];

    checkAchievementUnlock(sessions[sessions.length - 1], sessions);

    expect(sessions).toEqual(copy);
  });
});
