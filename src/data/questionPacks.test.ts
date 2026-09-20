import { describe, expect, it } from 'vitest';
import { questionPacks } from './questionPacks';
import { questions } from './questions';

describe('question packs', () => {
  it('provide three complete themed sessions with unique question ids', () => {
    expect(questionPacks).toHaveLength(3);
    expect(questionPacks.every((pack) => pack.questions.length === 6)).toBe(true);

    const allIds = [
      ...questions.map((question) => question.id),
      ...questionPacks.flatMap((pack) => pack.questions.map((question) => question.id)),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('does not put private free-text answers into the reusable packs', () => {
    expect(questionPacks.flatMap((pack) => pack.questions).every(
      (question) => question.type !== 'text',
    )).toBe(true);
  });
});
