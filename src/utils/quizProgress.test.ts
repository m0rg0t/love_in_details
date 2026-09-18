import { describe, expect, it } from 'vitest';
import type { QuizState } from '../types';
import {
  clearQuizProgress,
  loadQuizProgress,
  saveQuizProgress,
} from './quizProgress';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const progressState: QuizState = {
  panel: 'quiz-b',
  currentQuestion: 1,
  answersA: {
    'support-comfort': 'hug',
    'comm-conflict': 'speak',
    'time-evening': 'home',
  },
  answersB: { 'support-comfort': 'listen' },
  playerLabel: 'B',
  mode: 'daily',
  questionIds: ['support-comfort', 'comm-conflict', 'time-evening'],
  results: null,
  stats: null,
};

describe('quiz progress persistence', () => {
  it('restores an unfinished quiz with its exact daily question set', () => {
    const storage = createStorage();
    const savedAt = new Date('2026-09-18T12:00:00.000Z');

    saveQuizProgress(progressState, storage, savedAt);

    expect(loadQuizProgress(storage, savedAt.getTime() + 60_000)).toMatchObject({
      state: progressState,
      savedAt: savedAt.toISOString(),
    });
  });

  it('drops progress after its retention window', () => {
    const storage = createStorage();
    const savedAt = new Date('2026-09-01T12:00:00.000Z');

    saveQuizProgress(progressState, storage, savedAt);

    expect(loadQuizProgress(
      storage,
      new Date('2026-09-10T12:00:00.000Z').getTime(),
    )).toBeNull();
  });

  it('does not save a completed result as resumable progress', () => {
    const storage = createStorage();

    expect(saveQuizProgress({ ...progressState, panel: 'results' }, storage)).toBeNull();
    expect(loadQuizProgress(storage)).toBeNull();
  });

  it('can explicitly forget a saved quiz', () => {
    const storage = createStorage();
    saveQuizProgress(progressState, storage);

    clearQuizProgress(storage);

    expect(loadQuizProgress(storage)).toBeNull();
  });
});
