/**
 * Mock data for screenshot generation
 * Provides diverse, visually interesting answers for all 12 questions
 */

import type { Answers, ComparisonResult, ComparisonStats } from '../src/types';
import { questions } from '../src/data/questions';
import { compareAnswers } from '../src/utils/comparison';

// Player A's answers
export const mockAnswersA: Answers = {
  // Block 1: Support (Поддержка и близость)
  'support-comfort': 'hug', // Different from B → dialogue_topic
  'support-love-language': 'words', // Same as B → match
  'support-feeling-loved': 'когда партнёр проявляет интерес к моему дню и делам',

  // Block 2: Communication (Коммуникация)
  'comm-conflict': 'speak', // Different from B → dialogue_topic
  'comm-expressing': 4, // diff=1 with B → match
  'comm-heard': 'eye-contact', // Same as B → match

  // Block 3: Time (Время и границы)
  'time-together': 5, // diff=3 with B → soft_difference
  'time-space': 3, // Same as B → match
  'time-evening': 'out', // Same as B → match

  // Block 4: Direction (Направление)
  'dir-priority': 'growth', // Different from B → dialogue_topic
  'dir-future': 4, // diff=2 with B → soft_difference
  'dir-important-now': 'доверие и открытость друг к другу',
};

// Player B's answers
export const mockAnswersB: Answers = {
  // Block 1: Support
  'support-comfort': 'listen', // Different from A
  'support-love-language': 'words', // Same as A
  'support-feeling-loved': 'когда мне уделяют время и внимание без телефона',

  // Block 2: Communication
  'comm-conflict': 'withdraw', // Different from A
  'comm-expressing': 5, // diff=1 with A
  'comm-heard': 'eye-contact', // Same as A

  // Block 3: Time
  'time-together': 2, // diff=3 with A
  'time-space': 3, // Same as A
  'time-evening': 'out', // Same as A

  // Block 4: Direction
  'dir-priority': 'stability', // Different from A
  'dir-future': 2, // diff=2 with A
  'dir-important-now': 'стабильность и уверенность в будущем',
};

// Generate results using the actual comparison function
const { results, stats } = compareAnswers(mockAnswersA, mockAnswersB, questions);

export const mockResults: ComparisonResult[] = results;
export const mockStats: ComparisonStats = stats;
