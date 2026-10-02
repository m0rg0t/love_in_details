import { describe, expect, it } from 'vitest';
import type { QuizState } from '../types';
import {
  clearQuizProgress,
  loadQuizProgress,
  saveQuizProgress,
} from './quizProgress';
import { getQuestionPack } from '../data/questionPacks';
import { questions } from '../data/questions';

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
  packId: null,
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

  it('restores an unfinished thematic pack', () => {
    const storage = createStorage();
    const pack = getQuestionPack('care');
    expect(pack).not.toBeNull();

    const packState: QuizState = {
      ...progressState,
      mode: 'pack',
      packId: 'care',
      currentQuestion: 0,
      answersA: {},
      answersB: {},
      questionIds: pack!.questions.map((question) => question.id),
    };

    saveQuizProgress(packState, storage);

    expect(loadQuizProgress(storage)?.state).toEqual(packState);
  });

  it('migrates saved progress created before themed packs existed', () => {
    const storage = createStorage();
    const legacyState = { ...progressState } as Partial<QuizState>;
    delete legacyState.packId;
    storage.setItem('love-in-details:quiz-progress:v1', JSON.stringify({
      version: 1,
      savedAt: '2026-09-20T12:00:00.000Z',
      state: legacyState,
    }));

    expect(loadQuizProgress(storage, new Date('2026-09-20T12:01:00.000Z').getTime())?.state.packId)
      .toBeNull();
  });
});


describe('saved answer validation', () => {
  const fullState: QuizState = {
    ...progressState, mode: 'full', questionIds: questions.map(question => question.id),
    answersA: {}, answersB: {},
  };

  it.each([
    ['support-comfort', 'unknown'],
    ['comm-conflict', 1],
    ['comm-expressing', -1],
    ['comm-expressing', 6],
    ['comm-expressing', 2.5],
    ['comm-expressing', '3'],
    ['support-feeling-loved', 42],
    ['support-feeling-loved', 'x'.repeat(201)],
  ])('rejects a malformed stored answer for %s: %s', (questionId, answer) => {
    const storage = createStorage();
    const state = { ...fullState, answersA: { [questionId]: answer } };
    expect(saveQuizProgress(state, storage)).toBeNull();
    storage.setItem('love-in-details:quiz-progress:v1', JSON.stringify({
      version: 2, savedAt: new Date().toISOString(), state,
    }));
    expect(loadQuizProgress(storage)).toBeNull();
    expect(storage.getItem('love-in-details:quiz-progress:v1')).toBeNull();
  });

  it('keeps valid scale boundaries and unfinished text input', () => {
    const storage = createStorage();
    const state = { ...fullState, answersA: {
      'comm-expressing': 1, 'time-together': 5,
      'support-feeling-loved': '', 'dir-important-now': 'x'.repeat(200),
    } };
    expect(saveQuizProgress(state, storage)).not.toBeNull();
    expect(loadQuizProgress(storage)?.state).toEqual(state);
  });
});
