import type { PanelId, QuestionPackId, QuizMode } from '../types';
import type { ResultTone } from './resultPresentation';

const WEBSITE_ID = '634d5cfa-226f-49c0-89cc-468720deb73c';
const pendingEvents: Array<{ event: string; data?: Record<string, string | number> }> = [];

export function sanitizeReferrer(value: string): string {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? `${url.origin}${url.pathname}` : '';
  } catch { return ''; }
}

function track(event?: string, data?: Record<string, string | number>) {
  if (!window.umami) {
    if (event && pendingEvents.length < 50) pendingEvents.push({ event, data });
    return;
  }
  try {
    // Object payload avoids Umami's default signed URL/referrer on every event.
    window.umami?.track({
      website: WEBSITE_ID,
      hostname: window.location.hostname,
      url: window.location.pathname,
      referrer: sanitizeReferrer(document.referrer),
      title: 'Любовь в деталях',
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      ...(event ? { name: event, data } : {}),
    });
  } catch { /* Analytics must never interrupt the quiz. */ }
}

export function initializeAnalytics(): void {
  const ready = () => {
    track();
    for (const { event, data } of pendingEvents.splice(0)) track(event, data);
  };
  if (window.umami) ready();
  else document.getElementById('umami-script')?.addEventListener('load', ready, { once: true });
}

function bool(value: boolean): number {
  return value ? 1 : 0;
}

export type PromptOpenSource = 'welcome' | 'results';

export function trackAppStart(mode: 'vk' | 'ok' | 'standalone', hasSavedProgress = false) {
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

export function trackShare(method: 'story' | 'link', success: boolean) {
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

export function trackWeeklyThemeStart(
  packId: QuestionPackId,
  weekKey: string,
  isReplay: boolean,
) {
  track('weekly_theme_start', {
    pack_id: packId,
    week_key: weekKey,
    is_replay: bool(isReplay),
  });
}

export function trackWeeklyThemeComplete(packId: QuestionPackId, weekKey: string) {
  track('weekly_theme_complete', { pack_id: packId, week_key: weekKey });
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
