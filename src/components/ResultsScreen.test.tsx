import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ComparisonResult, ComparisonStats, Question } from '../types';
import { ResultsScreen } from './ResultsScreen';

vi.mock('./ResultSummary', () => ({ ResultSummary: () => <div>Сводка</div> }));
vi.mock('./ResultHighlights', () => ({ ResultHighlights: () => <div>Главное</div> }));
vi.mock('./RelationshipMap', () => ({ RelationshipMap: () => <div>Карта</div> }));
vi.mock('./PromptIdeasCard', () => ({ PromptIdeasCard: () => <div>Промпты</div> }));
vi.mock('./ShareSection', () => ({ ShareSection: () => <div>Поделиться</div> }));
vi.mock('./ResultCard', () => ({
  ResultCard: ({ question }: { question: Question }) => <div>Деталь: {question.text}</div>,
}));

const question: Question = {
  id: 'question',
  type: 'binary',
  block: 'support',
  blockLabel: 'Поддержка',
  text: 'Тестовый вопрос',
  options: [
    { value: 'yes', label: 'Да' },
    { value: 'no', label: 'Нет' },
  ],
};

const results: ComparisonResult[] = [{
  questionId: question.id,
  category: 'match',
  answerA: 'yes',
  answerB: 'yes',
  message: 'Совпадение',
}];

const stats: ComparisonStats = {
  matchCount: 1,
  softDiffCount: 0,
  dialogueCount: 0,
  totalQuestions: 1,
  summaryMessage: 'Совпадение',
};

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => vi.restoreAllMocks());

describe('ResultsScreen detailed answers', () => {
  it('uses the correct Russian plural form for three answers', () => {
    render(
      <ResultsScreen
        id="results"
        results={results}
        stats={{ ...stats, totalQuestions: 3 }}
        questions={[question]}
        onRestart={vi.fn()}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Все 3 ответа' })).not.toBeNull();
  });

  it('waits for the ad attempt before revealing answers', async () => {
    let finishAdAttempt: (() => void) | undefined;
    const adAttempt = new Promise<void>((resolve) => { finishAdAttempt = resolve; });
    const onRevealDetails = vi.fn().mockReturnValue(adAttempt);
    render(
      <ResultsScreen
        id="results"
        results={results}
        stats={stats}
        questions={[question]}
        onRestart={vi.fn()}
        onRevealDetails={onRevealDetails}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Показать все ответы' }));
    fireEvent.click(screen.getByRole('button', { name: 'Загрузка...' }));

    expect(screen.queryByText('Деталь: Тестовый вопрос')).toBeNull();
    expect(onRevealDetails).toHaveBeenCalledTimes(1);
    await act(async () => finishAdAttempt?.());
    await waitFor(() => expect(screen.queryByText('Деталь: Тестовый вопрос')).not.toBeNull());
  });

  it('fails open and does not request a second ad', async () => {
    const onRevealDetails = vi.fn().mockRejectedValue(new Error('No ad fill'));
    render(
      <ResultsScreen
        id="results"
        results={results}
        stats={stats}
        questions={[question]}
        onRestart={vi.fn()}
        onRevealDetails={onRevealDetails}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Показать все ответы' }));
    await waitFor(() => expect(screen.queryByText('Деталь: Тестовый вопрос')).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть подробности' }));
    fireEvent.click(screen.getByRole('button', { name: 'Показать все ответы' }));

    expect(screen.queryByText('Деталь: Тестовый вопрос')).not.toBeNull();
    expect(onRevealDetails).toHaveBeenCalledTimes(1);
  });
});
