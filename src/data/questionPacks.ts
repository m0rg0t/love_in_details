import type { Question, QuestionPackId } from '../types';
import { questions } from './questions';

export interface QuestionPack {
  id: QuestionPackId;
  title: string;
  eyebrow: string;
  description: string;
  accent: 'rose' | 'violet' | 'sunset';
  imageSrc: string;
  imagePosition: string;
  duration: string;
  questions: Question[];
}

export const questionPacks: QuestionPack[] = [
  {
    id: 'care',
    title: 'Уют и забота',
    eyebrow: 'Про каждый день',
    description: 'Как вы поддерживаете друг друга и создаёте ощущение дома.',
    accent: 'rose',
    imageSrc: '/assets/question-packs/care.webp',
    imagePosition: '50% 42%',
    duration: '4 минуты',
    questions: [
      {
        id: 'care-after-day',
        type: 'single',
        block: 'support',
        blockLabel: 'Забота',
        text: 'После сложного дня мне приятнее всего, когда партнёр:',
        options: [
          { value: 'hug', label: 'Молча обнимает', emoji: '🫂' },
          { value: 'listen', label: 'Расспрашивает и слушает', emoji: '👂' },
          { value: 'comfort', label: 'Берёт бытовые дела на себя', emoji: '☕' },
          { value: 'space', label: 'Даёт немного побыть одному', emoji: '🌿' },
        ],
      },
      {
        id: 'care-chores',
        type: 'binary',
        block: 'time',
        blockLabel: 'Общий быт',
        text: 'Домашние дела нам удобнее:',
        options: [
          { value: 'plan', label: 'Заранее распределить', emoji: '🗓️' },
          { value: 'flow', label: 'Решать по ситуации', emoji: '🌊' },
        ],
      },
      {
        id: 'care-morning',
        type: 'binary',
        block: 'time',
        blockLabel: 'Общий ритм',
        text: 'Идеальное совместное утро — это:',
        options: [
          { value: 'slow', label: 'Не спешить и завтракать вместе', emoji: '🥐' },
          { value: 'active', label: 'Рано начать насыщенный день', emoji: '☀️' },
        ],
      },
      {
        id: 'care-help',
        type: 'single',
        block: 'support',
        blockLabel: 'Забота',
        text: 'Какой маленький знак внимания особенно радует меня?',
        options: [
          { value: 'message', label: 'Тёплое сообщение', emoji: '💌' },
          { value: 'treat', label: 'Любимое угощение', emoji: '🍓' },
          { value: 'task', label: 'Помощь без просьбы', emoji: '✨' },
          { value: 'touch', label: 'Объятие или поцелуй', emoji: '💞' },
        ],
      },
      {
        id: 'care-tension',
        type: 'binary',
        block: 'communication',
        blockLabel: 'Спокойный разговор',
        text: 'Если дома возникло напряжение, я предпочитаю:',
        options: [
          { value: 'talk', label: 'Обсудить всё сразу', emoji: '💬' },
          { value: 'pause', label: 'Сначала выдохнуть и вернуться позже', emoji: '⏳' },
        ],
      },
      {
        id: 'care-rituals',
        type: 'scale',
        block: 'direction',
        blockLabel: 'Традиции пары',
        text: 'Насколько важны мне наши маленькие совместные ритуалы?',
        minLabel: 'Не очень',
        maxLabel: 'Очень важны',
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'dreams',
    title: 'Мечты и планы',
    eyebrow: 'Про ваше завтра',
    description: 'Сверьте желания, темп перемен и то, как вы поддерживаете идеи друг друга.',
    accent: 'violet',
    imageSrc: '/assets/question-packs/dreams.webp',
    imagePosition: '50% 45%',
    duration: '4 минуты',
    questions: [
      {
        id: 'dreams-next-year',
        type: 'single',
        block: 'direction',
        blockLabel: 'Общее будущее',
        text: 'Что мне особенно хотелось бы пережить вместе в ближайший год?',
        options: [
          { value: 'travel', label: 'Большое путешествие', emoji: '✈️' },
          { value: 'home', label: 'Сделать дом уютнее', emoji: '🏡' },
          { value: 'project', label: 'Начать общее дело', emoji: '🛠️' },
          { value: 'calm', label: 'Больше спокойных дней вдвоём', emoji: '🌙' },
        ],
      },
      {
        id: 'dreams-planning',
        type: 'binary',
        block: 'communication',
        blockLabel: 'Планы',
        text: 'Общее будущее мне комфортнее:',
        options: [
          { value: 'details', label: 'Планировать заранее и подробно', emoji: '🗺️' },
          { value: 'direction', label: 'Знать направление и импровизировать', emoji: '🧭' },
        ],
      },
      {
        id: 'dreams-change',
        type: 'scale',
        block: 'direction',
        blockLabel: 'Перемены',
        text: 'Насколько я сейчас открыт(а) большим переменам в нашей жизни?',
        minLabel: 'Хочется стабильности',
        maxLabel: 'Готов(а) к переменам',
        min: 1,
        max: 5,
      },
      {
        id: 'dreams-priority',
        type: 'single',
        block: 'time',
        blockLabel: 'Приоритеты',
        text: 'На что я охотнее потратил(а) бы общий свободный ресурс?',
        options: [
          { value: 'experience', label: 'Новые впечатления', emoji: '🎟️' },
          { value: 'comfort', label: 'Комфорт и дом', emoji: '🛋️' },
          { value: 'learning', label: 'Обучение и развитие', emoji: '📚' },
          { value: 'reserve', label: 'Запас на будущее', emoji: '🌱' },
        ],
      },
      {
        id: 'dreams-support',
        type: 'single',
        block: 'support',
        blockLabel: 'Поддержка идей',
        text: 'Когда я делюсь смелой мечтой, мне важнее услышать:',
        options: [
          { value: 'believe', label: '«Я верю, что у тебя получится»', emoji: '💜' },
          { value: 'plan', label: '«Давай подумаем, как это сделать»', emoji: '🧩' },
          { value: 'together', label: '«Я хочу быть частью этого»', emoji: '🤝' },
          { value: 'questions', label: 'Внимательные вопросы', emoji: '💭' },
        ],
      },
      {
        id: 'dreams-horizon',
        type: 'scale',
        block: 'direction',
        blockLabel: 'Горизонт',
        text: 'Насколько далеко вперёд мне нравится строить совместные планы?',
        minLabel: 'На пару недель',
        maxLabel: 'На несколько лет',
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'adventures',
    title: 'Путешествия и впечатления',
    eyebrow: 'Про открытия вдвоём',
    description: 'Узнайте, как выглядит ваше идеальное приключение и кто задаёт его ритм.',
    accent: 'sunset',
    imageSrc: '/assets/question-packs/adventures.webp',
    imagePosition: '50% 46%',
    duration: '4 минуты',
    questions: [
      {
        id: 'adventures-weekend',
        type: 'binary',
        block: 'time',
        blockLabel: 'Выходные',
        text: 'Свободные выходные вдвоём я бы скорее провёл(а):',
        options: [
          { value: 'new-place', label: 'В новом месте', emoji: '🚗' },
          { value: 'favorite-place', label: 'В любимой знакомой обстановке', emoji: '🏠' },
        ],
      },
      {
        id: 'adventures-route',
        type: 'binary',
        block: 'direction',
        blockLabel: 'Маршрут',
        text: 'В поездке мне спокойнее, когда:',
        options: [
          { value: 'booked', label: 'Всё важное забронировано', emoji: '✅' },
          { value: 'open', label: 'Есть место для спонтанности', emoji: '🎲' },
        ],
      },
      {
        id: 'adventures-surprise',
        type: 'scale',
        block: 'support',
        blockLabel: 'Сюрпризы',
        text: 'Насколько мне нравятся неожиданные планы от партнёра?',
        minLabel: 'Лучше предупредить',
        maxLabel: 'Обожаю сюрпризы',
        min: 1,
        max: 5,
      },
      {
        id: 'adventures-memory',
        type: 'single',
        block: 'support',
        blockLabel: 'Впечатления',
        text: 'Какое совместное воспоминание мне хочется создавать чаще?',
        options: [
          { value: 'nature', label: 'Природа и красивые виды', emoji: '🏔️' },
          { value: 'culture', label: 'Города, выставки и концерты', emoji: '🎭' },
          { value: 'food', label: 'Новая еда и уютные места', emoji: '🍜' },
          { value: 'active', label: 'Движение и немного экстрима', emoji: '🏄' },
        ],
      },
      {
        id: 'adventures-pace',
        type: 'single',
        block: 'time',
        blockLabel: 'Темп',
        text: 'В путешествии мой идеальный темп — это:',
        options: [
          { value: 'slow', label: 'Одно место и без спешки', emoji: '🌅' },
          { value: 'balanced', label: 'Планы днём, отдых вечером', emoji: '⚖️' },
          { value: 'full', label: 'Увидеть максимум', emoji: '⚡' },
          { value: 'mood', label: 'Каждый день по настроению', emoji: '🎈' },
        ],
      },
      {
        id: 'adventures-photos',
        type: 'binary',
        block: 'communication',
        blockLabel: 'Воспоминания',
        text: 'В новом месте мне важнее:',
        options: [
          { value: 'photos', label: 'Сохранить красивые кадры', emoji: '📷' },
          { value: 'moment', label: 'Побыть в моменте без телефона', emoji: '💫' },
        ],
      },
    ],
  },
];

export const allQuestions: Question[] = [
  ...questions,
  ...questionPacks.flatMap((pack) => pack.questions),
];

export function getQuestionPack(packId: QuestionPackId | null): QuestionPack | null {
  return questionPacks.find((pack) => pack.id === packId) ?? null;
}

export function getQuizLabel(mode: 'full' | 'daily' | 'pack', packId: QuestionPackId | null): string {
  if (mode === 'daily') return 'Вопросы дня';
  if (mode === 'pack') return getQuestionPack(packId)?.title ?? 'Тематический набор';
  return 'Полный квиз';
}
