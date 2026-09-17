import React, { useState } from 'react';
import { Button, Panel, Spinner } from '@vkontakte/vkui';
import { Icon24ChevronDown, Icon24ChevronUp } from '@vkontakte/icons';
import type { ComparisonResult, ComparisonStats, Question } from '../types';
import { ResultSummary } from './ResultSummary';
import { ResultCard } from './ResultCard';
import { ResultHighlights } from './ResultHighlights';
import { RelationshipMap } from './RelationshipMap';
import { ShareSection } from './ShareSection';
import { PromptIdeasCard } from './PromptIdeasCard';

interface ResultsScreenProps {
  id: string;
  results: ComparisonResult[] | null;
  stats: ComparisonStats | null;
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
  const [showDetails, setShowDetails] = useState(false);

  if (!results || !stats) {
    return (
      <Panel id={id}>
        <div className="results results--loading" aria-label="Готовим результаты">
          <Spinner size="l" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <div className="results">
        <ResultSummary stats={stats} />

        <ResultHighlights results={results} questions={questions} />

        <RelationshipMap results={results} questions={questions} />

        <PromptIdeasCard />

        <section className="results-details" aria-labelledby="results-details-title">
          <div className="results-section__heading results-details__heading">
            <span className="results-section__eyebrow">Подробный разбор</span>
            <h2 id="results-details-title">Все {stats.totalQuestions} ответов</h2>
            <p>Откройте, чтобы спокойно пройтись по каждому вопросу вместе.</p>
          </div>

          <Button
            size="l"
            mode="secondary"
            className="results-details__toggle"
            aria-expanded={showDetails}
            aria-controls="results-details-list"
            after={showDetails ? <Icon24ChevronUp /> : <Icon24ChevronDown />}
            onClick={() => setShowDetails((visible) => !visible)}
          >
            {showDetails ? 'Скрыть подробности' : 'Показать все ответы'}
          </Button>

          {showDetails && (
            <div id="results-details-list" className="results-cards">
              {results.map((result, index) => {
                const question = questions.find((item) => item.id === result.questionId);
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
          )}
        </section>

        <ShareSection stats={stats} />

        <div className="results__restart">
          <Button
            size="l"
            mode="tertiary"
            onClick={() => {
              setShowDetails(false);
              onRestart();
            }}
          >
            Пройти ещё раз
          </Button>
        </div>
      </div>
    </Panel>
  );
};
