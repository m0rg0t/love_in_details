import { questionPacks, type QuestionPack } from '../data/questionPacks';
import type { SessionHistoryEntry } from './sessionHistory';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const RANGE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

export const WEEKLY_THEME_IMAGE = '/assets/share/weekly-twilight.webp';

export interface WeeklyTheme {
  key: string;
  pack: QuestionPack;
  startsAt: number;
  endsAt: number;
  dateLabel: string;
  imageSrc: string;
}

function getLocalCalendarDayUtc(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeekStart(date = new Date()): number {
  const calendarDay = getLocalCalendarDayUtc(date);
  const dayOfWeek = new Date(calendarDay).getUTCDay() || 7;
  return calendarDay - (dayOfWeek - 1) * DAY_MS;
}

function formatRange(startsAt: number, endsAt: number): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt - DAY_MS);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    const month = RANGE_FORMATTER.format(end).replace(/^\d+\s+/, '');
    return `${start.getUTCDate()}–${end.getUTCDate()} ${month}`;
  }

  return `${RANGE_FORMATTER.format(start)} — ${RANGE_FORMATTER.format(end)}`;
}

export function getWeeklyTheme(date = new Date()): WeeklyTheme {
  const startsAt = getWeekStart(date);
  const endsAt = startsAt + WEEK_MS;
  const weekIndex = Math.floor(startsAt / WEEK_MS);
  const pack = questionPacks[((weekIndex % questionPacks.length) + questionPacks.length)
    % questionPacks.length];

  return {
    key: new Date(startsAt).toISOString().slice(0, 10),
    pack,
    startsAt,
    endsAt,
    dateLabel: formatRange(startsAt, endsAt),
    imageSrc: WEEKLY_THEME_IMAGE,
  };
}

export function isWeeklyThemeCompleted(
  entries: SessionHistoryEntry[],
  theme: WeeklyTheme,
): boolean {
  return entries.some((entry) => {
    const completedAt = Date.parse(entry.completedAt);
    return entry.mode === 'pack'
      && entry.packId === theme.pack.id
      && completedAt >= theme.startsAt
      && completedAt < theme.endsAt;
  });
}
