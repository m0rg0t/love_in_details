import React, { useCallback, useRef, useState } from 'react';
import { Button, Panel, Spinner } from '@vkontakte/vkui';
import { Icon24ChevronDown, Icon24ChevronUp } from '@vkontakte/icons';
import type { ComparisonResult, ComparisonStats, Question } from '../types';
import { ResultSummary } from './ResultSummary';
import { ResultCard } from './ResultCard';
import { ResultHighlights } from './ResultHighlights';
import { RelationshipMap } from './RelationshipMap';
import { ShareSection } from './ShareSection';
import { PromptIdeasCard } from './PromptIdeasCard';
import { ResultActionCard } from './ResultActionCard';
import { FavoriteReturnCard } from './FavoriteReturnCard';
import { getRelationshipAction } from '../utils/relationshipActions';
import { getResultPresentation, type ResultTone } from '../utils/resultPresentation';

interface ResultsScreenProps {
  id: string;
  results: ComparisonResult[] | null;
  stats: ComparisonStats | null;
  questions: Question[];
  sessionSeed?: string;
  initialActionCompleted?: boolean;
  onRestart: () => void;
  onRevealDetails?: () => Promise<unknown>;
  onActionComplete?: (actionId: string, tone: ResultTone) => void;
}

function getAnswersHeading(count: number): string {
  if (count === 1) return 'Ответ на вопрос';
  const modulo100 = count % 100;
  const modulo10 = count % 10;
  const form = modulo100 >= 11 && modulo100 <= 19
    ? 'ответов'
    : modulo10 >= 2 && modulo10 <= 4
      ? 'ответа'
      : 'ответов';
  return `Все ${count} ${form}`;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  id,
  results,
  stats,
  questions,
  sessionSeed,
  initialActionCompleted = false,
  onRestart,
  onRevealDetails,
  onActionComplete,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isRevealingDetails, setIsRevealingDetails] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(initialActionCompleted);
  const adAttemptedRef = useRef(false);
  const revealPendingRef = useRef(false);

  const handleDetailsToggle = useCallback(async () => {
    if (showDetails) {
      setShowDetails(false);
      return;
    }

    if (revealPendingRef.current || isRevealingDetails) return;

    if (!adAttemptedRef.current && onRevealDetails) {
      adAttemptedRef.current = true;
      revealPendingRef.current = true;
      setIsRevealingDetails(true);
      try {
        await onRevealDetails();
      } catch {
        // Ads are optional: detailed answers must remain available on failure.
      } finally {
        revealPendingRef.current = false;
        setIsRevealingDetails(false);
        setShowDetails(true);
      }
      return;
    }

    setShowDetails(true);
  }, [isRevealingDetails, onRevealDetails, showDetails]);

  if (!results || !stats) {
    return (
      <Panel id={id}>
        <div className="results results--loading" aria-label="Готовим результаты">
          <Spinner size="l" />
        </div>
      </Panel>
    );
  }

  const tone = getResultPresentation(stats).tone;
  const action = getRelationshipAction(
    tone,
    sessionSeed ?? results.map((result) => result.questionId).join('-'),
  );

  return (
    <Panel id={id}>
      <div className="results">
        <ResultSummary stats={stats} />

        <ResultHighlights results={results} questions={questions} />

        <RelationshipMap results={results} questions={questions} />

        <ResultActionCard
          action={action}
          completed={actionCompleted}
          onComplete={() => {
            if (actionCompleted) return;
            setActionCompleted(true);
            onActionComplete?.(action.id, tone);
          }}
        />

        <FavoriteReturnCard />

        <PromptIdeasCard />

        <section className="results-details" aria-labelledby="results-details-title">
          <div className="results-section__heading results-details__heading">
            <span className="results-section__eyebrow">Подробный разбор</span>
            <h2 id="results-details-title">{getAnswersHeading(stats.totalQuestions)}</h2>
            <p>Откройте, чтобы спокойно пройтись по каждому вопросу вместе.</p>
          </div>

          <Button
            size="l"
            mode="secondary"
            className="results-details__toggle"
            aria-expanded={showDetails}
            aria-controls="results-details-list"
            after={showDetails ? <Icon24ChevronUp /> : <Icon24ChevronDown />}
            loading={isRevealingDetails}
            disabled={isRevealingDetails}
            onClick={() => void handleDetailsToggle()}
          >
            {isRevealingDetails
              ? 'Открываем ответы…'
              : showDetails
                ? 'Скрыть подробности'
                : 'Показать все ответы'}
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
