import { describe, expect, it } from 'vitest';
import {
  loadSessionHistory,
  markHistoryActionComplete,
  recordSessionHistory,
} from './sessionHistory';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('session history', () => {
  it('stores result metadata without storing either participant answers', () => {
    const storage = createStorage();
    const completedAt = new Date('2026-09-20T12:00:00.000Z');

    const { entry } = recordSessionHistory({
      mode: 'pack',
      packId: 'dreams',
      matchCount: 4,
      totalQuestions: 6,
      tone: 'balanced',
    }, storage, completedAt, 'session-1');

    expect(entry).toMatchObject({
      id: 'session-1',
      completedAt: completedAt.toISOString(),
      packId: 'dreams',
      actionCompleted: false,
    });
    expect(JSON.stringify(loadSessionHistory(storage))).not.toContain('answers');
  });

  it('marks the shared result action as completed', () => {
    const storage = createStorage();
    recordSessionHistory({
      mode: 'daily',
      packId: null,
      matchCount: 2,
      totalQuestions: 3,
      tone: 'in_sync',
    }, storage, new Date('2026-09-20T12:00:00.000Z'), 'session-1');

    const entries = markHistoryActionComplete('session-1', storage);

    expect(entries[0]?.actionCompleted).toBe(true);
  });

  it('keeps only the twenty latest sessions', () => {
    const storage = createStorage();

    for (let index = 0; index < 22; index += 1) {
      recordSessionHistory({
        mode: 'full',
        packId: null,
        matchCount: index % 13,
        totalQuestions: 12,
        tone: 'balanced',
      }, storage, new Date(Date.UTC(2026, 8, 1 + index)), `session-${index}`);
    }

    const entries = loadSessionHistory(storage, new Date('2026-10-01T00:00:00.000Z').getTime());
    expect(entries).toHaveLength(20);
    expect(entries[0]?.id).toBe('session-21');
    expect(entries[entries.length - 1]?.id).toBe('session-2');
  });
});
