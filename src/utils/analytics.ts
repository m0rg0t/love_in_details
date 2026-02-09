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

export function trackAppStart(mode: 'vk' | 'standalone') {
  track('app_start', { mode });
}

export function trackQuizStart() {
  track('quiz_start');
}

export function trackQuestionAnswer(questionId: string, questionNumber: number) {
  track('question_answer', { question_id: questionId, question_number: questionNumber });
}

export function trackPlayerSwitch() {
  track('player_switch');
}

export function trackQuizComplete(matchCount: number, totalQuestions: number) {
  track('quiz_complete', { match_count: matchCount, total_questions: totalQuestions });
}

export function trackShare(method: 'story' | 'wall', success: boolean) {
  track('share', { method, success: bool(success) });
}

export function trackAdShow(format: 'interstitial' | 'banner', success: boolean) {
  track('ad_show', { format, success: bool(success) });
}

export function trackRestart() {
  track('restart');
}

export function trackOpenOtredach(success: boolean) {
  track('open_otredach', { success: bool(success) });
}
