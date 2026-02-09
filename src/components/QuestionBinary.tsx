import React from 'react';
import type { QuestionBinary as QuestionBinaryType } from '../types';

interface QuestionBinaryProps {
  question: QuestionBinaryType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const QuestionBinary: React.FC<QuestionBinaryProps> = ({ question, value, onChange }) => {
  return (
    <div className="binary-choice">
      {question.options.map((option) => (
        <div
          key={option.value}
          className={`binary-card ${value === option.value ? 'binary-card--selected' : ''}`}
          onClick={() => onChange(option.value)}
          role="radio"
          aria-checked={value === option.value}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(option.value); } }}
        >
          {option.emoji && <span className="binary-card__emoji">{option.emoji}</span>}
          <span className="binary-card__label">{option.label}</span>
        </div>
      ))}
    </div>
  );
};
