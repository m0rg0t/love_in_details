import type {
  Answers,
  Question,
  ComparisonCategory,
  ComparisonResult,
  ComparisonStats,
} from '../types';
import { questions } from '../data/questions';

function getMessage(category: ComparisonCategory, questionType: Question['type']): string {
  if (questionType === 'text') return 'Интересно сравнить ваши мысли';
  switch (category) {
    case 'match':
      return 'У вас схожее понимание этого вопроса';
    case 'soft_difference':
      return 'Вы смотрите на это немного по-разному — и это нормально';
    case 'dialogue_topic':
      return 'Хорошая тема, чтобы спокойно обсудить её вместе';
  }
}

function compareOne(question: Question, answerA: string | number, answerB: string | number): ComparisonCategory {
  switch (question.type) {
    case 'single':
    case 'binary':
      return answerA === answerB ? 'match' : 'dialogue_topic';

    case 'scale': {
      const diff = Math.abs(Number(answerA) - Number(answerB));
      if (diff <= 1) return 'match';
      if (diff <= 3) return 'soft_difference';
      return 'dialogue_topic';
    }

    case 'text':
      return 'dialogue_topic';
  }
}

export function computeStats(results: ComparisonResult[]): ComparisonStats {
  const matchCount = results.filter((r) => r.category === 'match').length;
  const softDiffCount = results.filter((r) => r.category === 'soft_difference').length;
  const dialogueCount = results.filter((r) => r.category === 'dialogue_topic').length;
  const totalQuestions = results.length;

  let summaryMessage: string;
  if (matchCount >= 8) {
    summaryMessage = 'Вы во многом совпадаете! Отличная основа для понимания.';
  } else if (matchCount >= 5) {
    summaryMessage = 'У вас хороший баланс совпадений и различий.';
  } else {
    summaryMessage = 'У вас много тем для интересного разговора!';
  }

  return { matchCount, softDiffCount, dialogueCount, totalQuestions, summaryMessage };
}

export function compareAnswers(
  answersA: Answers,
  answersB: Answers,
  questionsList: Question[] = questions,
): { results: ComparisonResult[]; stats: ComparisonStats } {
  const results: ComparisonResult[] = questionsList.map((question) => {
    const answerA = answersA[question.id] ?? '';
    const answerB = answersB[question.id] ?? '';
    const category = compareOne(question, answerA, answerB);
    const message = getMessage(category, question.type);

    return { questionId: question.id, category, answerA, answerB, message };
  });

  const stats = computeStats(results);
  return { results, stats };
}
