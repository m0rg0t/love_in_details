import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { getDailyQuestions, getLocalDateKey } from './dailyQuestions';

describe('daily questions', () => {
  it('returns the same compact set throughout a local calendar day', () => {
    const morning = new Date(2026, 8, 18, 8, 30);
    const evening = new Date(2026, 8, 18, 22, 45);

    expect(getLocalDateKey(morning)).toBe('2026-09-18');
    expect(getDailyQuestions(questions, morning).map((question) => question.id))
      .toEqual(getDailyQuestions(questions, evening).map((question) => question.id));
  });

  it('selects three unique, quick questions from different topics', () => {
    const selected = getDailyQuestions(questions, new Date(2026, 8, 18, 12));

    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((question) => question.id))).toHaveLength(3);
    expect(new Set(selected.map((question) => question.block))).toHaveLength(3);
    expect(selected.every((question) => question.type !== 'text')).toBe(true);
  });

  it('rotates the selection on another day', () => {
    const today = getDailyQuestions(questions, new Date(2026, 8, 18, 12));
    const tomorrow = getDailyQuestions(questions, new Date(2026, 8, 19, 12));

    expect(tomorrow.map((question) => question.id))
      .not.toEqual(today.map((question) => question.id));
  });
});
