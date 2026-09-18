import type { Question, QuestionBlock } from '../types';

const DAILY_QUESTION_COUNT = 3;
const BLOCK_ORDER: QuestionBlock[] = ['support', 'communication', 'time', 'direction'];

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashDateKey(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Builds a deterministic local-day selection. Keeping text questions out of
 * this mode makes the daily ritual short enough to finish together.
 */
export function getDailyQuestions(
  allQuestions: Question[],
  date = new Date(),
): Question[] {
  const eligible = allQuestions.filter((question) => question.type !== 'text');
  const availableBlocks = BLOCK_ORDER.filter((block) =>
    eligible.some((question) => question.block === block),
  );

  if (availableBlocks.length === 0) return [];

  const seed = hashDateKey(getLocalDateKey(date));
  const selectedBlocks = Array.from(
    { length: Math.min(DAILY_QUESTION_COUNT, availableBlocks.length) },
    (_, index) => availableBlocks[(seed + index) % availableBlocks.length],
  );

  return selectedBlocks.flatMap((block, index) => {
    const candidates = eligible.filter((question) => question.block === block);
    if (candidates.length === 0) return [];
    return [candidates[(seed + index * 7) % candidates.length]];
  });
}
