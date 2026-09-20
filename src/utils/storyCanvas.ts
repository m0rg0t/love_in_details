import type { ComparisonStats } from '../types';
import { getResultPresentation } from './resultPresentation';
import { WEEKLY_THEME_IMAGE } from './weeklyTheme';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Share illustration could not be loaded'));
    image.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (imageRatio > canvasRatio) {
    sourceWidth = image.naturalHeight * canvasRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / canvasRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
}

/** Generate a private 1080×1920 result mood card for VK Stories. */
export async function generateStoryImage(stats: ComparisonStats): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable');

  const presentation = getResultPresentation(stats);
  const artwork = await loadImage(WEEKLY_THEME_IMAGE);
  drawCoverImage(ctx, artwork, STORY_WIDTH, STORY_HEIGHT);

  const colorWash = ctx.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  colorWash.addColorStop(0, 'rgba(58, 32, 88, 0.38)');
  colorWash.addColorStop(0.52, 'rgba(112, 49, 94, 0.08)');
  colorWash.addColorStop(1, 'rgba(28, 14, 39, 0.62)');
  ctx.fillStyle = colorWash;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  const topShade = ctx.createLinearGradient(0, 0, 0, 760);
  topShade.addColorStop(0, 'rgba(25, 13, 38, 0.5)');
  topShade.addColorStop(1, 'rgba(25, 13, 38, 0)');
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, STORY_WIDTH, 760);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.font = '650 29px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('ЛЮБОВЬ В ДЕТАЛЯХ', STORY_WIDTH / 2, 118);
  ctx.letterSpacing = 'normal';

  ctx.fillStyle = '#ffacd0';
  ctx.font = '700 27px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('НАШ РИТМ ВДВОЁМ', STORY_WIDTH / 2, 264);
  ctx.letterSpacing = 'normal';

  ctx.fillStyle = '#ffffff';
  ctx.font = '750 74px -apple-system, BlinkMacSystemFont, sans-serif';
  const titleBottom = drawWrappedText(
    ctx,
    presentation.title,
    STORY_WIDTH / 2,
    366,
    870,
    84,
  );

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '450 34px -apple-system, BlinkMacSystemFont, sans-serif';
  drawWrappedText(
    ctx,
    'У каждой пары свой ритм. Узнайте ваш за один короткий разговор.',
    STORY_WIDTH / 2,
    titleBottom + 78,
    780,
    48,
  );

  roundedRect(ctx, 125, 1570, 830, 236, 52);
  ctx.fillStyle = 'rgba(35, 19, 48, 0.62)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('А какой ритм у вас?', STORY_WIDTH / 2, 1648);

  roundedRect(ctx, 250, 1690, 580, 82, 41);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.fill();
  ctx.fillStyle = '#553279';
  ctx.font = '700 29px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Открыть квиз для двоих', STORY_WIDTH / 2, 1743);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Без публикации ваших ответов', STORY_WIDTH / 2, 1855);

  return canvas.toDataURL('image/jpeg', 0.92);
}
