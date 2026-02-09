import type { Question } from '../types';

export const questions: Question[] = [
  // ── Block 1: support (Поддержка и близость) ──────────────────────
  {
    id: 'support-comfort',
    type: 'single',
    block: 'support',
    blockLabel: 'Поддержка и близость',
    text: 'Когда мне тяжело, я чаще всего хочу:',
    options: [
      { value: 'hug', label: 'Чтобы меня обняли', emoji: '🫂' },
      { value: 'listen', label: 'Чтобы меня выслушали', emoji: '👂' },
      { value: 'solve', label: 'Чтобы мне помогли решить проблему', emoji: '🧠' },
      { value: 'alone', label: 'Чтобы меня оставили в покое', emoji: '⏳' },
    ],
  },
  {
    id: 'support-love-language',
    type: 'single',
    block: 'support',
    blockLabel: 'Поддержка и близость',
    text: 'Я чаще всего проявляю любовь через:',
    options: [
      { value: 'words', label: 'Слова и комплименты', emoji: '💬' },
      { value: 'touch', label: 'Прикосновения и объятия', emoji: '🤗' },
      { value: 'time', label: 'Совместное время', emoji: '⏰' },
      { value: 'help', label: 'Помощь и заботу', emoji: '🤝' },
    ],
  },
  {
    id: 'support-feeling-loved',
    type: 'text',
    block: 'support',
    blockLabel: 'Поддержка и близость',
    text: 'Я чувствую себя любимым(ой), когда...',
    placeholder: 'Опишите своими словами...',
    maxLength: 200,
  },

  // ── Block 2: communication (Коммуникация) ────────────────────────
  {
    id: 'comm-conflict',
    type: 'binary',
    block: 'communication',
    blockLabel: 'Коммуникация',
    text: 'В сложном разговоре я чаще:',
    options: [
      { value: 'withdraw', label: 'Беру паузу, ухожу подумать', emoji: '🚶' },
      { value: 'speak', label: 'Говорю сразу, что чувствую', emoji: '🗣️' },
    ],
  },
  {
    id: 'comm-expressing',
    type: 'scale',
    block: 'communication',
    blockLabel: 'Коммуникация',
    text: 'Насколько легко мне говорить о своих чувствах?',
    minLabel: 'Сложно',
    maxLabel: 'Легко',
    min: 1,
    max: 5,
  },
  {
    id: 'comm-heard',
    type: 'single',
    block: 'communication',
    blockLabel: 'Коммуникация',
    text: 'Я чувствую себя услышанным(ой), когда партнёр:',
    options: [
      { value: 'eye-contact', label: 'Смотрит в глаза и кивает', emoji: '👀' },
      { value: 'repeats', label: 'Повторяет своими словами', emoji: '🔄' },
      { value: 'advice', label: 'Предлагает решение', emoji: '💡' },
      { value: 'listens', label: 'Просто слушает, не перебивая', emoji: '🤫' },
    ],
  },

  // ── Block 3: time (Время и границы) ──────────────────────────────
  {
    id: 'time-together',
    type: 'scale',
    block: 'time',
    blockLabel: 'Время и границы',
    text: 'Насколько для меня важно проводить время вместе каждый день?',
    minLabel: 'Не важно',
    maxLabel: 'Очень важно',
    min: 1,
    max: 5,
  },
  {
    id: 'time-space',
    type: 'scale',
    block: 'time',
    blockLabel: 'Время и границы',
    text: 'Насколько мне важно личное пространство?',
    minLabel: 'Не важно',
    maxLabel: 'Очень важно',
    min: 1,
    max: 5,
  },
  {
    id: 'time-evening',
    type: 'binary',
    block: 'time',
    blockLabel: 'Время и границы',
    text: 'Идеальный совместный вечер — это:',
    options: [
      { value: 'out', label: 'Выйти куда-то вместе', emoji: '🌆' },
      { value: 'home', label: 'Уютный вечер дома', emoji: '🏠' },
    ],
  },

  // ── Block 4: direction (Направление) ────────────────────────────
  {
    id: 'dir-priority',
    type: 'binary',
    block: 'direction',
    blockLabel: 'Направление',
    text: 'В отношениях для меня сейчас важнее:',
    options: [
      { value: 'stability', label: 'Стабильность и спокойствие', emoji: '⚓' },
      { value: 'growth', label: 'Развитие и новый опыт', emoji: '🚀' },
    ],
  },
  {
    id: 'dir-future',
    type: 'scale',
    block: 'direction',
    blockLabel: 'Направление',
    text: 'Как часто я думаю о нашем совместном будущем?',
    minLabel: 'Редко',
    maxLabel: 'Часто',
    min: 1,
    max: 5,
  },
  {
    id: 'dir-important-now',
    type: 'text',
    block: 'direction',
    blockLabel: 'Направление',
    text: 'Что для меня сейчас самое важное в наших отношениях?',
    placeholder: 'Опишите своими словами...',
    maxLength: 200,
  },
];
