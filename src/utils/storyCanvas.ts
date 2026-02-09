import type { ComparisonStats } from '../types';

/**
 * Generate a story image (1080x1920) as base64 data URL.
 * Pink-to-purple gradient with stats summary.
 */
export async function generateStoryImage(stats: ComparisonStats): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#e8739e');
  gradient.addColorStop(1, '#7c5cbf');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative hearts (subtle)
  ctx.globalAlpha = 0.1;
  ctx.font = '120px serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('💕', 80, 300);
  ctx.fillText('💕', 800, 1600);
  ctx.fillText('❤️', 700, 500);
  ctx.fillText('❤️', 150, 1400);
  ctx.globalAlpha = 1;

  // Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Любовь в деталях', canvas.width / 2, 700);

  // Heart emoji
  ctx.font = '160px serif';
  ctx.fillText('💕', canvas.width / 2, 950);

  // Stats
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Совпали в ${stats.matchCount} из ${stats.totalQuestions}`, canvas.width / 2, 1150);

  // Subtitle
  ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.globalAlpha = 0.8;
  ctx.fillText(stats.summaryMessage, canvas.width / 2, 1250);
  ctx.globalAlpha = 1;

  // CTA
  ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.globalAlpha = 0.6;
  ctx.fillText('Пройдите квиз вместе!', canvas.width / 2, 1700);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/jpeg', 0.9);
}
