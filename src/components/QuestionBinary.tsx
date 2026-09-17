import React from 'react';
import type { QuestionBinary as QuestionBinaryType } from '../types';

interface QuestionBinaryProps {
  question: QuestionBinaryType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const QuestionBinary: React.FC<QuestionBinaryProps> = ({ question, value, onChange }) => {
  return (
    <div className="binary-choice" role="radiogroup" aria-label={question.text}>
      {question.options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`binary-card ${value === option.value ? 'binary-card--selected' : ''}`}
          onClick={() => onChange(option.value)}
          role="radio"
          aria-checked={value === option.value}
        >
          {option.emoji && <span className="binary-card__emoji" aria-hidden="true">{option.emoji}</span>}
          <span className="binary-card__label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
