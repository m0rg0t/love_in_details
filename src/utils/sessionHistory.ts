import type { QuestionPackId, QuizMode } from '../types';
import type { ResultTone } from './resultPresentation';

const STORAGE_KEY = 'love-in-details:session-history:v1';
const STORAGE_VERSION = 1;
const MAX_ENTRIES = 20;
const HISTORY_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const VALID_MODES: QuizMode[] = ['full', 'daily', 'pack'];
const VALID_PACK_IDS: QuestionPackId[] = ['care', 'dreams', 'adventures'];
const VALID_TONES: ResultTone[] = ['in_sync', 'balanced', 'discovering'];

export interface SessionHistoryEntry {
  id: string;
  completedAt: string;
  mode: QuizMode;
  packId: QuestionPackId | null;
  matchCount: number;
  totalQuestions: number;
  tone: ResultTone;
  actionCompleted: boolean;
}

export type NewSessionHistoryEntry = Omit<SessionHistoryEntry, 'id' | 'completedAt' | 'actionCompleted'>;

interface SessionHistorySnapshot {
  version: typeof STORAGE_VERSION;
  entries: SessionHistoryEntry[];
}

export interface HistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): unknown;
  removeItem(key: string): unknown;
}

function defaultStorage(): HistoryStorage | null {
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

function isEntry(value: unknown, now: number): value is SessionHistoryEntry {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || typeof value.completedAt !== 'string') return false;
  const completedAt = Date.parse(value.completedAt);
  if (!Number.isFinite(completedAt) || now - completedAt > HISTORY_TTL_MS) return false;
  if (!VALID_MODES.includes(value.mode as QuizMode)) return false;
  if (value.packId !== null && !VALID_PACK_IDS.includes(value.packId as QuestionPackId)) return false;
  if (value.mode === 'pack' && value.packId === null) return false;
  if (value.mode !== 'pack' && value.packId !== null) return false;
  if (!Number.isInteger(value.matchCount) || !Number.isInteger(value.totalQuestions)) return false;
  if ((value.matchCount as number) < 0 || (value.totalQuestions as number) < 1) return false;
  if ((value.matchCount as number) > (value.totalQuestions as number)) return false;
  if (!VALID_TONES.includes(value.tone as ResultTone)) return false;
  return typeof value.actionCompleted === 'boolean';
}

function saveEntries(entries: SessionHistoryEntry[], storage: HistoryStorage | null): void {
  if (!storage) return;
  const snapshot: SessionHistorySnapshot = { version: STORAGE_VERSION, entries };
  try { storage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* storage is optional */ }
}

function createEntryId(completedAt: Date): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${completedAt.getTime()}-${randomPart}`;
}

export function loadSessionHistory(
  storage: HistoryStorage | null = defaultStorage(),
  now = Date.now(),
): SessionHistoryEntry[] {
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.entries)) {
      storage.removeItem(STORAGE_KEY);
      return [];
    }

    const entries = parsed.entries
      .filter((entry) => isEntry(entry, now))
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
      .slice(0, MAX_ENTRIES);

    if (entries.length !== parsed.entries.length) saveEntries(entries, storage);
    return entries;
  } catch {
    try { storage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
    return [];
  }
}

export function recordSessionHistory(
  input: NewSessionHistoryEntry,
  storage: HistoryStorage | null = defaultStorage(),
  completedAt = new Date(),
  id = createEntryId(completedAt),
): { entry: SessionHistoryEntry; entries: SessionHistoryEntry[] } {
  const entry: SessionHistoryEntry = {
    ...input,
    id,
    completedAt: completedAt.toISOString(),
    actionCompleted: false,
  };
  const entries = [entry, ...loadSessionHistory(storage, completedAt.getTime())].slice(0, MAX_ENTRIES);
  saveEntries(entries, storage);
  return { entry, entries };
}

export function markHistoryActionComplete(
  entryId: string,
  storage: HistoryStorage | null = defaultStorage(),
): SessionHistoryEntry[] {
  const entries = loadSessionHistory(storage).map((entry) => (
    entry.id === entryId ? { ...entry, actionCompleted: true } : entry
  ));
  saveEntries(entries, storage);
  return entries;
}
