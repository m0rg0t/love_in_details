import React, { useRef, useEffect } from 'react';
import type { QuestionText as QuestionTextType } from '../types';

interface QuestionTextProps {
  question: QuestionTextType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const QuestionText: React.FC<QuestionTextProps> = ({ question, value = '', onChange }) => {
  const charCount = value.length;
  const isNearLimit = charCount > question.maxLength * 0.8;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus after animation completes
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 350); // 300ms animation + 50ms buffer

    return () => clearTimeout(focusTimer);
  }, []); // Empty deps = focus only on mount

  // Mobile fallback handler
  const handleClick = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="text-input-wrapper">
      <textarea
        ref={textareaRef}
        onClick={handleClick}
        autoFocus
        inputMode="text"
        aria-label={question.text}
        id={`question-${question.id}`}
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
