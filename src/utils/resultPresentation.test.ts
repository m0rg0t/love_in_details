import { describe, expect, it } from 'vitest';
import type { ComparisonResult } from '../types';
import { questions } from '../data/questions';
import {
  getBlockPortrait,
  getFeaturedResults,
  getResultPresentation,
} from './resultPresentation';

function makeResult(
  questionId: string,
  category: ComparisonResult['category'],
): ComparisonResult {
  return { questionId, category, answerA: 'a', answerB: 'b', message: 'message' };
}

describe('result presentation', () => {
  it.each([
    [8, 'in_sync'],
    [5, 'balanced'],
    [4, 'discovering'],
  ] as const)('selects the result tone for %s matches', (matchCount, tone) => {
    expect(getResultPresentation({
      matchCount,
      softDiffCount: 0,
      dialogueCount: 12 - matchCount,
      totalQuestions: 12,
      summaryMessage: '',
    }).tone).toBe(tone);
  });

  it('features one result from every available comparison category', () => {
    const results = [
      makeResult('match-1', 'match'),
      makeResult('match-2', 'match'),
      makeResult('soft-1', 'soft_difference'),
      makeResult('dialogue-1', 'dialogue_topic'),
    ];

    expect(getFeaturedResults(results).map((result) => result.category)).toEqual([
      'match',
      'soft_difference',
      'dialogue_topic',
    ]);
  });

  it('does not treat free-text responses as a mismatch in the block portrait', () => {
    const supportResults = [
      makeResult('support-comfort', 'match'),
      makeResult('support-love-language', 'match'),
      makeResult('support-feeling-loved', 'dialogue_topic'),
    ];

    const support = getBlockPortrait(supportResults, questions)
      .find((item) => item.block === 'support');

    expect(support?.state).toBe('shared');
  });

  it('omits topics that were not part of a compact quiz', () => {
    const compactQuestions = questions.filter((question) =>
      ['support-comfort', 'comm-conflict', 'time-evening'].includes(question.id),
    );
    const compactResults = compactQuestions.map((question) => makeResult(question.id, 'match'));

    expect(getBlockPortrait(compactResults, compactQuestions).map((item) => item.block)).toEqual([
      'support',
      'communication',
      'time',
    ]);
  });
});
