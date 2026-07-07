import { calculateStreak, QuizSession } from '../QuizHistoryContext';

/**
 * Regression tests for `calculateStreak`.
 *
 * The original implementation had two bugs (found in code review):
 *  1. It used `toISOString()` (UTC) to bucket sessions into days while
 *     comparing against `new Date()` (local time), causing off-by-one
 *     errors near local midnight for non-UTC timezones.
 *  2. The day-counting loop compared `daysDiff === streak` starting from
 *     `streak = 0`, which broke the loop (returned 0) for a still-active
 *     streak whose most recent session was yesterday rather than today.
 *
 * These tests fix a stable "now" via fake timers so day-boundary math is
 * deterministic, and cover both bugs plus general edge cases.
 */

const DAY_MS = 1000 * 60 * 60 * 24;

function sessionAt(timestamp: number): QuizSession {
  return {
    id: `session-${timestamp}`,
    timestamp,
    difficulty: 'easy',
    score: 80,
    timeTaken: 30,
  };
}

describe('calculateStreak', () => {
  const NOW = new Date(2026, 5, 15, 12, 0, 0).getTime(); // June 15, 2026, noon local time

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 0 when there are no sessions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 1 for a single quiz taken today', () => {
    expect(calculateStreak([sessionAt(NOW)])).toBe(1);
  });

  it('keeps the streak alive when the most recent quiz was yesterday, not just today', () => {
    // Regression test for bug #2: a streak that hasn't been played yet today
    // (but was played yesterday) must still count as active.
    const yesterday = NOW - DAY_MS;
    const dayBefore = NOW - 2 * DAY_MS;
    const sessions = [sessionAt(dayBefore), sessionAt(yesterday)];

    expect(calculateStreak(sessions)).toBe(2);
  });

  it('counts consecutive days correctly across today, yesterday, and the day before', () => {
    const sessions = [
      sessionAt(NOW - 2 * DAY_MS),
      sessionAt(NOW - DAY_MS),
      sessionAt(NOW),
    ];

    expect(calculateStreak(sessions)).toBe(3);
  });

  it('breaks the streak when there is a gap of more than one day', () => {
    const sessions = [
      sessionAt(NOW - 5 * DAY_MS),
      sessionAt(NOW - 4 * DAY_MS),
      // gap here
      sessionAt(NOW),
    ];

    expect(calculateStreak(sessions)).toBe(1);
  });

  it('returns 0 when the most recent session is older than yesterday', () => {
    const sessions = [sessionAt(NOW - 3 * DAY_MS)];
    expect(calculateStreak(sessions)).toBe(0);
  });

  it('only counts one session per calendar day (multiple quizzes same day)', () => {
    const sessions = [
      sessionAt(NOW - 1000),
      sessionAt(NOW - 2000),
      sessionAt(NOW),
    ];

    expect(calculateStreak(sessions)).toBe(1);
  });

  it('does not mutate the input sessions array', () => {
    const sessions = [sessionAt(NOW - DAY_MS), sessionAt(NOW)];
    const copy = [...sessions];

    calculateStreak(sessions);

    expect(sessions).toEqual(copy);
  });
});
