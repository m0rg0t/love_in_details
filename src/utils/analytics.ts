import type { PanelId, QuestionPackId, QuizMode } from '../types';
import type { ResultTone } from './resultPresentation';

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

function track(event: string, data?: Record<string, string | number>) {
  try { window.umami?.track(event, data); } catch { /* silently ignore */ }
}

function bool(value: boolean): number {
  return value ? 1 : 0;
}

export type PromptOpenSource = 'welcome' | 'results';

export function trackAppStart(mode: 'vk' | 'standalone', hasSavedProgress = false) {
  track('app_start', { mode, has_saved_progress: bool(hasSavedProgress) });
}

export function trackQuizStart(quizMode: QuizMode, packId: QuestionPackId | null = null) {
  track('quiz_start', {
    quiz_mode: quizMode,
    ...(packId ? { pack_id: packId } : {}),
  });
}

export function trackQuizResume(quizMode: QuizMode, panel: PanelId) {
  track('quiz_resume', { quiz_mode: quizMode, panel });
}

export function trackQuestionAnswer(questionId: string, questionNumber: number) {
  track('question_answer', { question_id: questionId, question_number: questionNumber });
}

export function trackPlayerSwitch() {
  track('player_switch');
}

export function trackQuizComplete(matchCount: number, totalQuestions: number, quizMode: QuizMode) {
  track('quiz_complete', {
    match_count: matchCount,
    total_questions: totalQuestions,
    quiz_mode: quizMode,
  });
}

export function trackShare(method: 'story' | 'wall', success: boolean) {
  track('share', { method, success: bool(success) });
}

export function trackAdShow(format: 'interstitial' | 'banner', success: boolean) {
  track('ad_show', { format, success: bool(success) });
}

export function trackRestart(quizMode: QuizMode) {
  track('restart', { quiz_mode: quizMode });
}

export function trackAddToFavorites(success: boolean) {
  track('add_to_favorites', { success: bool(success) });
}

export function trackPacksOpen() {
  track('packs_open');
}

export function trackPackStart(packId: QuestionPackId) {
  track('pack_start', { pack_id: packId });
}

export function trackHistoryOpen(entriesCount: number) {
  track('history_open', { entries_count: entriesCount });
}

export function trackResultActionComplete(actionId: string, tone: ResultTone) {
  track('result_action_complete', { action_id: actionId, tone });
}

export function trackOpenImagePrompts(
  promptId: string,
  source: PromptOpenSource,
  success: boolean,
) {
  track('open_image_prompts', {
    prompt_id: promptId,
    source,
    success: bool(success),
  });
}
