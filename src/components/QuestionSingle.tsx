import React from 'react';
import type { QuestionSingle as QuestionSingleType } from '../types';

interface QuestionSingleProps {
  question: QuestionSingleType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const QuestionSingle: React.FC<QuestionSingleProps> = ({ question, value, onChange }) => {
  return (
    <div className="options-list" role="radiogroup" aria-label={question.text}>
      {question.options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`option-card ${value === option.value ? 'option-card--selected' : ''}`}
          onClick={() => onChange(option.value)}
          role="radio"
          aria-checked={value === option.value}
        >
          {option.emoji && <span className="option-card__emoji" aria-hidden="true">{option.emoji}</span>}
          <span className="option-card__label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
