import { describe, expect, it } from 'vitest';
import type { QuizState } from '../types';
import { quizReducer } from './useQuizState';

const quizState: QuizState = {
  panel: 'quiz-a',
  currentQuestion: 4,
  answersA: { first: 'answer' },
  answersB: {},
  playerLabel: 'A',
  mode: 'full',
  questionIds: ['first', 'second', 'third', 'fourth', 'fifth'],
  results: null,
  stats: null,
};

describe('quizReducer navigation', () => {
  it('moves to the previous question without dropping answers', () => {
    const nextState = quizReducer(quizState, { type: 'PREVIOUS_QUESTION' });
    expect(nextState.currentQuestion).toBe(3);
    expect(nextState.answersA).toEqual(quizState.answersA);
  });

  it('does not move before the first question', () => {
    const nextState = quizReducer(
      { ...quizState, currentQuestion: 0 },
      { type: 'PREVIOUS_QUESTION' },
    );
    expect(nextState.currentQuestion).toBe(0);
  });

  it('restores a previous panel while preserving the completed answers', () => {
    const nextState = quizReducer(
      { ...quizState, panel: 'handoff', currentQuestion: 11 },
      { type: 'NAVIGATE_TO_PANEL', panel: 'quiz-a' },
    );

    expect(nextState).toMatchObject({
      panel: 'quiz-a',
      currentQuestion: 11,
      playerLabel: 'A',
      answersA: quizState.answersA,
    });
  });

  it('clears stale result data when reopening the last quiz question', () => {
    const nextState = quizReducer(
      {
        ...quizState,
        panel: 'results',
        playerLabel: 'B',
        results: [{
          questionId: 'fifth',
          category: 'match',
          answerA: 'yes',
          answerB: 'yes',
          message: 'match',
        }],
        stats: {
          matchCount: 1,
          softDiffCount: 0,
          dialogueCount: 0,
          totalQuestions: 1,
          summaryMessage: 'match',
        },
      },
      { type: 'NAVIGATE_TO_PANEL', panel: 'quiz-b' },
    );

    expect(nextState).toMatchObject({ panel: 'quiz-b', results: null, stats: null });
  });
});
