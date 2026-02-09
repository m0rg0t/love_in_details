import React from 'react';
import type { ComparisonStats } from '../types';

interface ResultSummaryProps {
  stats: ComparisonStats;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ stats }) => {
  return (
    <div className="results-summary">
      <div className="results-summary__emoji">💕</div>
      <h2 className="results-summary__title">
        Вы совпали в {stats.matchCount} из {stats.totalQuestions} вопросов
      </h2>
      <p className="results-summary__message">{stats.summaryMessage}</p>

      <div className="results-summary__stats">
        <span className="stat-pill stat-pill--match">
          ✅ {stats.matchCount} совпадений
        </span>
        {stats.softDiffCount > 0 && (
          <span className="stat-pill stat-pill--soft-diff">
            〰️ {stats.softDiffCount} мягких различий
          </span>
        )}
        <span className="stat-pill stat-pill--dialogue">
          💬 {stats.dialogueCount} тем для диалога
        </span>
      </div>
    </div>
  );
};
