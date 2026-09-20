import { allQuestions, getQuestionPack } from '../data/questionPacks';
import { questions } from '../data/questions';
import type { Answers, PanelId, QuestionPackId, QuizMode, QuizState } from '../types';

const STORAGE_KEY = 'love-in-details:quiz-progress:v1';
const STORAGE_VERSION = 2;
const PROGRESS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const VALID_QUESTION_IDS = new Set(allQuestions.map((question) => question.id));
const BASE_QUESTION_IDS = new Set(questions.map((question) => question.id));
const IN_PROGRESS_PANELS: PanelId[] = ['quiz-a', 'handoff', 'quiz-b'];

export interface QuizProgressSnapshot {
  version: typeof STORAGE_VERSION;
  savedAt: string;
  state: QuizState;
}

export interface ProgressStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): unknown;
  removeItem(key: string): unknown;
}

function defaultStorage(): ProgressStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAnswers(value: unknown, questionIds: string[]): value is Answers {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(([questionId, answer]) =>
    questionIds.includes(questionId) && (typeof answer === 'string' || typeof answer === 'number'),
  );
}

function isQuizMode(value: unknown): value is QuizMode {
  return value === 'full' || value === 'daily' || value === 'pack';
}

function isQuestionPackId(value: unknown): value is QuestionPackId {
  return value === 'care' || value === 'dreams' || value === 'adventures';
}

function withProgressDefaults(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return 'packId' in value ? value : { ...value, packId: null };
}

function isRestorableState(value: unknown): value is QuizState {
  if (!isRecord(value)) return false;
  if (!IN_PROGRESS_PANELS.includes(value.panel as PanelId)) return false;
  if (!isQuizMode(value.mode)) return false;
  if (value.packId !== null && !isQuestionPackId(value.packId)) return false;
  if (!Array.isArray(value.questionIds)) return false;

  const questionIds = value.questionIds;
  if (
    questionIds.length === 0
    || new Set(questionIds).size !== questionIds.length
    || !questionIds.every((id): id is string => typeof id === 'string' && VALID_QUESTION_IDS.has(id))
  ) {
    return false;
  }

  if (value.mode === 'daily' && (
    value.packId !== null
    || questionIds.length !== 3
    || !questionIds.every((id) => BASE_QUESTION_IDS.has(id))
  )) return false;
  if (value.mode === 'full' && (
    value.packId !== null
    || questionIds.length !== questions.length
    || !questionIds.every((id) => BASE_QUESTION_IDS.has(id))
  )) return false;
  if (value.mode === 'pack') {
    if (!isQuestionPackId(value.packId)) return false;
    const pack = getQuestionPack(value.packId);
    const packQuestionIds = new Set(pack?.questions.map((question) => question.id));
    if (!pack || questionIds.length !== pack.questions.length) return false;
    if (!questionIds.every((id) => packQuestionIds.has(id))) return false;
  }
  if (!Number.isInteger(value.currentQuestion)) return false;
  if ((value.currentQuestion as number) < 0 || (value.currentQuestion as number) >= questionIds.length) return false;
  if (value.playerLabel !== 'A' && value.playerLabel !== 'B') return false;
  if (value.panel === 'quiz-a' && value.playerLabel !== 'A') return false;
  if (value.panel === 'quiz-b' && value.playerLabel !== 'B') return false;
  if (value.panel === 'handoff' && value.playerLabel !== 'A') return false;
  if (!isAnswers(value.answersA, questionIds) || !isAnswers(value.answersB, questionIds)) return false;
  if (value.results !== null || value.stats !== null) return false;

  return true;
}

export function saveQuizProgress(
  state: QuizState,
  storage: ProgressStorage | null = defaultStorage(),
  savedAt = new Date(),
): QuizProgressSnapshot | null {
  if (!storage || !isRestorableState(state)) return null;

  const snapshot: QuizProgressSnapshot = {
    version: STORAGE_VERSION,
    savedAt: savedAt.toISOString(),
    state,
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return snapshot;
  } catch {
    return null;
  }
}

export function loadQuizProgress(
  storage: ProgressStorage | null = defaultStorage(),
  now = Date.now(),
): QuizProgressSnapshot | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed)
      || (parsed.version !== 1 && parsed.version !== STORAGE_VERSION)
      || typeof parsed.savedAt !== 'string'
    ) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    const savedAt = Date.parse(parsed.savedAt);
    const state = withProgressDefaults(parsed.state);
    if (!Number.isFinite(savedAt) || now - savedAt > PROGRESS_TTL_MS || !isRestorableState(state)) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    const snapshot: QuizProgressSnapshot = {
      version: STORAGE_VERSION,
      savedAt: parsed.savedAt,
      state,
    };
    if (parsed.version !== STORAGE_VERSION) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* migration is optional */ }
    }
    return snapshot;
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
    return null;
  }
}

export function clearQuizProgress(storage: ProgressStorage | null = defaultStorage()): void {
  if (!storage) return;
  try { storage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
}
