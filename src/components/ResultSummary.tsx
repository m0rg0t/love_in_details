import React from 'react';
import type { ComparisonStats } from '../types';
import { getResultPresentation } from '../utils/resultPresentation';
import { PairPortrait } from './PairPortrait';

interface ResultSummaryProps {
  stats: ComparisonStats;
}

function pluralize(count: number, forms: [string, string, string]): string {
  const modulo100 = count % 100;
  const modulo10 = count % 10;
  if (modulo100 >= 11 && modulo100 <= 19) return forms[2];
  if (modulo10 === 1) return forms[0];
  if (modulo10 >= 2 && modulo10 <= 4) return forms[1];
  return forms[2];
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ stats }) => {
  const presentation = getResultPresentation(stats);

  return (
    <section className={`result-hero result-hero--${presentation.tone}`} aria-labelledby="result-title">
      <div className="result-hero__copy">
        <span className="result-hero__eyebrow">Ваш портрет пары</span>
        <h1 id="result-title">{presentation.title}</h1>
        <p>{presentation.message}</p>

        <div className="result-hero__stats" role="group" aria-label="Сводка ответов">
          <span className="result-stat result-stat--match">
            <b>{stats.matchCount}</b>
            {pluralize(stats.matchCount, ['совпадение', 'совпадения', 'совпадений'])}
          </span>
          {stats.softDiffCount > 0 && (
            <span className="result-stat result-stat--soft-diff">
              <b>{stats.softDiffCount}</b>
              {pluralize(stats.softDiffCount, ['нюанс', 'нюанса', 'нюансов'])}
            </span>
          )}
          <span className="result-stat result-stat--dialogue">
            <b>{stats.dialogueCount}</b>
            {pluralize(stats.dialogueCount, ['тема', 'темы', 'тем'])} для диалога
          </span>
        </div>
      </div>

      <PairPortrait tone={presentation.tone} />
    </section>
  );
};
