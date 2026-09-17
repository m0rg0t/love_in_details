import type { Answer, Question } from '../types';

export function formatAnswer(question: Question, answer: Answer): string {
  if (question.type === 'single' || question.type === 'binary') {
    const option = question.options.find((item) => item.value === answer);
    return option ? `${option.emoji ?? ''} ${option.label}`.trim() : String(answer);
  }

  return String(answer);
}
