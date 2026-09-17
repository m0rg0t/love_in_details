import React from 'react';
import {
  Icon28CheckCircleOutline,
  Icon28MessageHeartOutline,
  Icon28SparkleOutline,
} from '@vkontakte/icons';
import type { ComparisonCategory, ComparisonResult, Question } from '../types';
import { formatAnswer } from '../utils/answers';
import { getFeaturedResults } from '../utils/resultPresentation';

interface ResultHighlightsProps {
  results: ComparisonResult[];
  questions: Question[];
}

const CATEGORY_COPY: Record<ComparisonCategory, { eyebrow: string; title: string }> = {
  match: { eyebrow: 'Общий ритм', title: 'Здесь вы особенно близки' },
  soft_difference: { eyebrow: 'Ваши нюансы', title: 'Здесь вы дополняете друг друга' },
  dialogue_topic: { eyebrow: 'Повод стать ближе', title: 'Об этом интересно поговорить' },
};

function CategoryIcon({ category }: { category: ComparisonCategory }) {
  if (category === 'match') return <Icon28CheckCircleOutline />;
  if (category === 'soft_difference') return <Icon28SparkleOutline />;
  return <Icon28MessageHeartOutline />;
}

export const ResultHighlights: React.FC<ResultHighlightsProps> = ({ results, questions }) => {
  const featured = getFeaturedResults(results);

  if (featured.length === 0) return null;

  return (
    <section className="results-section" aria-labelledby="result-highlights-title">
      <div className="results-section__heading">
        <span className="results-section__eyebrow">Главное о вас</span>
        <h2 id="result-highlights-title">Три момента, которые стоит заметить</h2>
      </div>

      <div className="result-highlights">
        {featured.map((result, index) => {
          const question = questions.find((item) => item.id === result.questionId);
          if (!question) return null;
          const copy = CATEGORY_COPY[result.category];

          return (
            <article
              className={`result-highlight result-highlight--${result.category}`}
              key={result.questionId}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="result-highlight__topline">
                <span className="result-highlight__icon" aria-hidden="true">
                  <CategoryIcon category={result.category} />
                </span>
                <span className="result-highlight__eyebrow">{copy.eyebrow}</span>
              </div>

              <h3>{copy.title}</h3>
              <p className="result-highlight__question">{question.text}</p>

              <div className="result-highlight__answers" role="group" aria-label="Ответы участников">
                <span><b>1</b>{formatAnswer(question, result.answerA)}</span>
                <span><b>2</b>{formatAnswer(question, result.answerB)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
