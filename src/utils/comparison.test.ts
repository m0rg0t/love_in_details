import { describe, expect, it } from 'vitest';
import type { Question } from '../types';
import { compareAnswers } from './comparison';

const scaleQuestion: Question = {
  id: 'scale',
  type: 'scale',
  block: 'communication',
  blockLabel: 'Коммуникация',
  text: 'Насколько?',
  min: 1,
  max: 5,
  minLabel: 'Мало',
  maxLabel: 'Много',
};

describe('compareAnswers', () => {
  it.each([
    [1, 2, 'match'],
    [1, 3, 'soft_difference'],
    [1, 5, 'dialogue_topic'],
  ] as const)('classifies scale answers %s and %s as %s', (answerA, answerB, category) => {
    const { results } = compareAnswers({ scale: answerA }, { scale: answerB }, [scaleQuestion]);
    expect(results[0].category).toBe(category);
  });

  it('counts every comparison in the summary', () => {
    const { stats } = compareAnswers({ scale: 3 }, { scale: 3 }, [scaleQuestion]);
    expect(stats).toMatchObject({ matchCount: 1, totalQuestions: 1 });
  });
});
