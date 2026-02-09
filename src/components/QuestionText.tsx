import React from 'react';
import type { QuestionText as QuestionTextType } from '../types';

interface QuestionTextProps {
  question: QuestionTextType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const QuestionText: React.FC<QuestionTextProps> = ({ question, value = '', onChange }) => {
  const charCount = value.length;
  const isNearLimit = charCount > question.maxLength * 0.8;

  return (
    <div className="text-input-wrapper">
      <textarea
        className="text-input"
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= question.maxLength) {
            onChange(e.target.value);
          }
        }}
        placeholder={question.placeholder}
        maxLength={question.maxLength}
        rows={4}
      />
      <span className={`text-input-counter ${isNearLimit ? 'text-input-counter--warning' : ''}`}>
        {charCount} / {question.maxLength}
      </span>
    </div>
  );
};
