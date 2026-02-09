/**
 * Debug mode utilities for screenshot generation and development
 * Only active when import.meta.env.DEV is true
 */

import type { PanelId, QuizState } from '../types';
import { mockAnswersA, mockAnswersB, mockResults, mockStats } from '../../screenshots/mockData';

/**
 * Check if debug mode is enabled via ?debug=true query parameter
 */
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'true';
}

/**
 * Get the panel to display from ?panel=<panelId> query parameter
 */
export function getDebugPanel(): PanelId | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const panel = params.get('panel');

  // Validate panel ID
  const validPanels: PanelId[] = ['welcome', 'quiz-a', 'handoff', 'quiz-b', 'results'];
  if (panel && validPanels.includes(panel as PanelId)) {
    return panel as PanelId;
  }

  return null;
}

/**
 * Get the question index from ?q=<index> query parameter
 */
export function getDebugQuestionIndex(): number | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');

  if (q !== null) {
    const index = parseInt(q, 10);
    if (!isNaN(index) && index >= 0 && index < 12) {
      return index;
    }
  }

  return null;
}

/**
 * Get a complete debug state with pre-populated mock data
 */
export function getDebugState(): QuizState {
  const panel = getDebugPanel() ?? 'welcome';
  const currentQuestion = getDebugQuestionIndex() ?? 0;

  return {
    panel,
    currentQuestion,
    answersA: mockAnswersA,
    answersB: mockAnswersB,
    playerLabel: 'A', // Doesn't matter for results screen
    results: mockResults,
    stats: mockStats,
  };
}
