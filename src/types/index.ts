/**
 * Types for "Любовь в деталях" couples quiz app
 */

// ── Question types ────────────────────────────────────────────────

export type QuestionType = 'single' | 'scale' | 'binary' | 'text';
export type QuestionBlock = 'support' | 'communication' | 'time' | 'direction';

export interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface QuestionBase {
  id: string;
  type: QuestionType;
  block: QuestionBlock;
  text: string;
  blockLabel: string;
}

export interface QuestionSingle extends QuestionBase {
  type: 'single';
  options: QuestionOption[];
}

export interface QuestionScale extends QuestionBase {
  type: 'scale';
  minLabel: string;
  maxLabel: string;
  min: number;
  max: number;
}

export interface QuestionBinary extends QuestionBase {
  type: 'binary';
  options: [QuestionOption, QuestionOption];
}

export interface QuestionText extends QuestionBase {
  type: 'text';
  placeholder: string;
  maxLength: number;
}

export type Question = QuestionSingle | QuestionScale | QuestionBinary | QuestionText;

// ── Answer types ──────────────────────────────────────────────────

export type Answer = string | number;
export type Answers = Record<string, Answer>;

// ── Navigation ────────────────────────────────────────────────────

export type PanelId = 'welcome' | 'quiz-a' | 'handoff' | 'quiz-b' | 'results';

// ── Comparison ────────────────────────────────────────────────────

export type ComparisonCategory = 'match' | 'soft_difference' | 'dialogue_topic';

export interface ComparisonResult {
  questionId: string;
  category: ComparisonCategory;
  answerA: Answer;
  answerB: Answer;
  message: string;
}

export interface ComparisonStats {
  matchCount: number;
  softDiffCount: number;
  dialogueCount: number;
  totalQuestions: number;
  summaryMessage: string;
}

// ── Quiz state ────────────────────────────────────────────────────

export type PlayerLabel = 'A' | 'B';

export interface QuizState {
  panel: PanelId;
  currentQuestion: number;
  answersA: Answers;
  answersB: Answers;
  playerLabel: PlayerLabel;
  results: ComparisonResult[] | null;
  stats: ComparisonStats | null;
}

export type QuizAction =
  | { type: 'START_QUIZ' }
  | { type: 'ANSWER_QUESTION'; questionId: string; answer: Answer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_PLAYER_A' }
  | { type: 'START_PLAYER_B' }
  | { type: 'FINISH_QUIZ'; results: ComparisonResult[]; stats: ComparisonStats }
  | { type: 'RESTART' };
