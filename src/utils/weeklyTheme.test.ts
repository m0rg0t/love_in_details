import { describe, expect, it } from 'vitest';
import { questionPacks } from '../data/questionPacks';
import type { SessionHistoryEntry } from './sessionHistory';
import { getWeeklyTheme, getWeekStart, isWeeklyThemeCompleted } from './weeklyTheme';

describe('weekly theme', () => {
  it('keeps the same featured pack from Monday through Sunday', () => {
    const monday = getWeeklyTheme(new Date(2026, 8, 21, 12));
    const sunday = getWeeklyTheme(new Date(2026, 8, 27, 23, 59));

    expect(getWeekStart(new Date(2026, 8, 21, 12))).toBe(monday.startsAt);
    expect(sunday.key).toBe(monday.key);
    expect(sunday.pack.id).toBe(monday.pack.id);
    expect(monday.dateLabel).toBe('21–27 сентября');
  });

  it('rotates to a different pack next week', () => {
    const current = getWeeklyTheme(new Date(2026, 8, 21, 12));
    const next = getWeeklyTheme(new Date(2026, 8, 28, 12));

    expect(next.key).not.toBe(current.key);
    expect(next.pack.id).not.toBe(current.pack.id);
  });

  it('counts only this week completion of the featured pack', () => {
    const theme = getWeeklyTheme(new Date(2026, 8, 21, 12));
    const baseEntry: SessionHistoryEntry = {
      id: 'session',
      completedAt: new Date(theme.startsAt + 2 * 24 * 60 * 60 * 1000).toISOString(),
      mode: 'pack',
      packId: theme.pack.id,
      matchCount: 4,
      totalQuestions: 6,
      tone: 'balanced',
      actionCompleted: false,
    };

    expect(isWeeklyThemeCompleted([baseEntry], theme)).toBe(true);
    const otherPack = questionPacks.find((pack) => pack.id !== theme.pack.id);
    expect(isWeeklyThemeCompleted([{
      ...baseEntry,
      packId: otherPack?.id ?? null,
    }], theme)).toBe(false);
    expect(isWeeklyThemeCompleted([{
      ...baseEntry,
      completedAt: new Date(theme.startsAt - 1).toISOString(),
    }], theme)).toBe(false);
  });
});
