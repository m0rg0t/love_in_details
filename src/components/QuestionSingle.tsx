import React from 'react';
import type { QuestionSingle as QuestionSingleType } from '../types';

interface QuestionSingleProps {
  question: QuestionSingleType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const QuestionSingle: React.FC<QuestionSingleProps> = ({ question, value, onChange }) => {
  return (
    <div className="options-list">
      {question.options.map((option) => (
        <div
          key={option.value}
          className={`option-card ${value === option.value ? 'option-card--selected' : ''}`}
          onClick={() => onChange(option.value)}
          role="radio"
          aria-checked={value === option.value}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(option.value); } }}
        >
          {option.emoji && <span className="option-card__emoji">{option.emoji}</span>}
          <span className="option-card__label">{option.label}</span>
        </div>
      ))}
    </div>
  );
};
