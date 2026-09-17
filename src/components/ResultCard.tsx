import React from 'react';
import type { ComparisonResult, Question } from '../types';
import { formatAnswer } from '../utils/answers';

interface ResultCardProps {
  result: ComparisonResult;
  question: Question;
  index: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, question, index }) => {
  const isScale = question.type === 'scale';

  return (
    <div
      className={`result-card result-card--${result.category}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <p className="result-card__question">{question.text}</p>

      {isScale && question.type === 'scale' ? (
        <div
          className="result-card__scale"
          role="img"
          aria-label={`Участник 1: ${result.answerA}. Участник 2: ${result.answerB}`}
        >
          <span style={{ fontSize: '12px', opacity: 0.5 }}>{question.minLabel}</span>
          <div className="result-card__scale-bar">
            <div
              className="result-card__scale-dot result-card__scale-dot--a"
              style={{ left: `${((Number(result.answerA) - question.min) / (question.max - question.min)) * 100}%` }}
              aria-hidden="true"
            />
            <div
              className="result-card__scale-dot result-card__scale-dot--b"
              style={{ left: `${((Number(result.answerB) - question.min) / (question.max - question.min)) * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <span style={{ fontSize: '12px', opacity: 0.5 }}>{question.maxLabel}</span>
        </div>
      ) : (
        <div className={`result-card__answers ${question.type === 'text' ? 'result-card__answers--text' : ''}`}>
          <div className="result-card__answer">
            <p className="result-card__player-label">Участник 1</p>
            <p className="result-card__answer-text">
              {formatAnswer(question, result.answerA)}
            </p>
          </div>
          <div className="result-card__answer">
            <p className="result-card__player-label">Участник 2</p>
            <p className="result-card__answer-text">
              {formatAnswer(question, result.answerB)}
            </p>
          </div>
        </div>
      )}

      <p className="result-card__message">{result.message}</p>
    </div>
  );
};
