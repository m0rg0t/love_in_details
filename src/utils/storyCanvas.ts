import type { ComparisonStats } from '../types';
import { getResultPresentation, type ResultTone } from './resultPresentation';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

const STORY_PALETTES: Record<ResultTone, [string, string, string]> = {
  in_sync: ['#4c2d86', '#a34891', '#ee7da4'],
  balanced: ['#332f78', '#7d4fa0', '#e57f9f'],
  discovering: ['#29356f', '#70519d', '#d879a7'],
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);

  lines.forEach((item, index) => {
    ctx.fillText(item, centerX, startY + index * lineHeight);
  });

  return startY + Math.max(0, lines.length - 1) * lineHeight;
}

function drawHeart(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number): void {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 26 * scale);
  ctx.bezierCurveTo(
    centerX - 72 * scale,
    centerY - 18 * scale,
    centerX - 50 * scale,
    centerY - 76 * scale,
    centerX,
    centerY - 35 * scale,
  );
  ctx.bezierCurveTo(
    centerX + 50 * scale,
    centerY - 76 * scale,
    centerX + 72 * scale,
    centerY - 18 * scale,
    centerX,
    centerY + 26 * scale,
  );
  ctx.closePath();
}

/** Generate a 1080×1920 editorial-style result card for VK Stories. */
export async function generateStoryImage(stats: ComparisonStats): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable');

  const presentation = getResultPresentation(stats);
  const [startColor, middleColor, endColor] = STORY_PALETTES[presentation.tone];

  const background = ctx.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  background.addColorStop(0, startColor);
  background.addColorStop(0.52, middleColor);
  background.addColorStop(1, endColor);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // Soft editorial texture, kept deterministic for consistent exports.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let index = 0; index < 42; index += 1) {
    const x = (index * 193 + 67) % STORY_WIDTH;
    const y = (index * 311 + 103) % STORY_HEIGHT;
    const radius = 2 + (index % 3);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(80, 520, 260, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1000, 1420, 330, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.font = '600 30px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('ЛЮБОВЬ В ДЕТАЛЯХ', STORY_WIDTH / 2, 130);
  ctx.letterSpacing = 'normal';

  ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('ВАШ ПОРТРЕТ ПАРЫ', STORY_WIDTH / 2, 245);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 72px -apple-system, BlinkMacSystemFont, sans-serif';
  const titleBottom = drawWrappedText(
    ctx,
    presentation.title,
    STORY_WIDTH / 2,
    345,
    850,
    84,
  );

  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.font = '400 34px -apple-system, BlinkMacSystemFont, sans-serif';
  drawWrappedText(
    ctx,
    presentation.message,
    STORY_WIDTH / 2,
    titleBottom + 78,
    820,
    48,
  );

  const artCenterY = 930;
  const matchRatio = stats.totalQuestions > 0 ? stats.matchCount / stats.totalQuestions : 0;
  const distance = 120 - matchRatio * 48;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const leftShape = ctx.createLinearGradient(250, 720, 550, 1120);
  leftShape.addColorStop(0, 'rgba(255, 216, 231, 0.94)');
  leftShape.addColorStop(1, 'rgba(255, 126, 172, 0.78)');
  ctx.fillStyle = leftShape;
  ctx.beginPath();
  ctx.arc(STORY_WIDTH / 2 - distance, artCenterY, 190, 0, Math.PI * 2);
  ctx.fill();

  const rightShape = ctx.createLinearGradient(520, 1120, 830, 720);
  rightShape.addColorStop(0, 'rgba(174, 151, 255, 0.82)');
  rightShape.addColorStop(1, 'rgba(248, 220, 255, 0.95)');
  ctx.fillStyle = rightShape;
  ctx.beginPath();
  ctx.arc(STORY_WIDTH / 2 + distance, artCenterY + 24, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(STORY_WIDTH / 2, artCenterY + 10, 262, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(65, 35, 104, 0.72)';
  drawHeart(ctx, STORY_WIDTH / 2, artCenterY + 2, 1.25);
  ctx.fill();

  const cards = [
    { value: stats.matchCount, label: 'совпадений' },
    { value: stats.softDiffCount, label: 'нюансов' },
    { value: stats.dialogueCount, label: 'тем для диалога' },
  ];

  cards.forEach((card, index) => {
    const width = 252;
    const gap = 24;
    const x = 138 + index * (width + gap);
    const y = 1280;
    roundedRect(ctx, x, y, width, 172, 34);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 52px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(String(card.value), x + width / 2, y + 70);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, sans-serif';
    drawWrappedText(ctx, card.label, x + width / 2, y + 116, width - 32, 30);
  });

  roundedRect(ctx, 170, 1640, 740, 92, 46);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.fill();
  ctx.fillStyle = '#553279';
  ctx.font = '700 31px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Пройдите квиз вдвоём', STORY_WIDTH / 2, 1698);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.font = '500 26px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('vk.ru · Любовь в деталях', STORY_WIDTH / 2, 1820);

  return canvas.toDataURL('image/jpeg', 0.92);
}
