import React from 'react';
import type { QuestionScale as QuestionScaleType } from '../types';

interface QuestionScaleProps {
  question: QuestionScaleType;
  value: number | undefined;
  onChange: (value: number) => void;
}

export const QuestionScale: React.FC<QuestionScaleProps> = ({ question, value, onChange }) => {
  const points = Array.from(
    { length: question.max - question.min + 1 },
    (_, i) => question.min + i
  );

  return (
    <div className="scale-selector">
      <div className="scale-selector__track">
        {points.map((point) => (
          <div
            key={point}
            className={`scale-selector__point ${value === point ? 'scale-selector__point--selected' : ''}`}
            onClick={() => onChange(point)}
            role="radio"
            aria-checked={value === point}
            aria-label={`${point}`}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(point); } }}
          >
            {point}
          </div>
        ))}
      </div>
      <div className="scale-selector__labels">
        <span className="scale-selector__label">{question.minLabel}</span>
        <span className="scale-selector__label">{question.maxLabel}</span>
      </div>
    </div>
  );
};
