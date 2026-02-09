import React from 'react';
import { Panel } from '@vkontakte/vkui';
import type { ComparisonResult, ComparisonStats, Answers, Question } from '../types';
import { ResultSummary } from './ResultSummary';
import { ResultCard } from './ResultCard';
import { ShareSection } from './ShareSection';

interface ResultsScreenProps {
  id: string;
  results: ComparisonResult[] | null;
  stats: ComparisonStats | null;
  answersA: Answers;
  answersB: Answers;
  questions: Question[];
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  id,
  results,
  stats,
  questions,
  onRestart,
}) => {
  if (!results || !stats) return <Panel id={id}><div>Loading...</div></Panel>;

  return (
    <Panel id={id}>
      <div className="results">
        <ResultSummary stats={stats} />

        <div className="results-cards">
          {results.map((result, index) => {
            const question = questions.find((q) => q.id === result.questionId);
            if (!question) return null;
            return (
              <ResultCard
                key={result.questionId}
                result={result}
                question={question}
                index={index}
              />
            );
          })}
        </div>

        <ShareSection stats={stats} />

        <div className="results__restart">
          <button className="gradient-button" onClick={onRestart}>
            Пройти ещё раз
          </button>
        </div>
      </div>
    </Panel>
  );
};
