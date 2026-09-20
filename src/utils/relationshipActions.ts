import type { ResultTone } from './resultPresentation';

export interface RelationshipAction {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const ACTIONS: Record<ResultTone, RelationshipAction[]> = {
  in_sync: [
    {
      id: 'gratitude-detail',
      emoji: '💌',
      title: 'Назовите одну любимую деталь',
      description: 'По очереди скажите, какую маленькую привычку партнёра вы особенно цените сегодня.',
    },
    {
      id: 'shared-ritual',
      emoji: '☕',
      title: 'Повторите ваш уютный ритуал',
      description: 'Выберите знакомую мелочь, которая делает вас ближе, и найдите для неё время сегодня.',
    },
    {
      id: 'memory',
      emoji: '📸',
      title: 'Вспомните ваш тёплый момент',
      description: 'Найдите общую фотографию и расскажите друг другу, что осталось за её кадром.',
    },
  ],
  balanced: [
    {
      id: 'choose-evening',
      emoji: '🌙',
      title: 'Соберите вечер из двух желаний',
      description: 'Каждый предлагает одну часть плана, а затем вы объединяете их в один вечер вдвоём.',
    },
    {
      id: 'swap-choice',
      emoji: '🔄',
      title: 'Дайте партнёру выбрать',
      description: 'Сегодня один выбирает место или занятие, а второй добавляет приятную маленькую деталь.',
    },
    {
      id: 'curious-question',
      emoji: '💬',
      title: 'Задайте вопрос без совета',
      description: 'Спросите, что сейчас вдохновляет партнёра, и пять минут только слушайте и уточняйте.',
    },
  ],
  discovering: [
    {
      id: 'one-difference',
      emoji: '🧩',
      title: 'Выберите одно интересное различие',
      description: 'Не ищите правильный ответ: расскажите, почему каждый вариант важен именно для вас.',
    },
    {
      id: 'mini-compromise',
      emoji: '🤝',
      title: 'Придумайте маленький компромисс',
      description: 'Возьмите одну тему из результата и найдите решение, где сегодня есть место обоим желаниям.',
    },
    {
      id: 'surprise-detail',
      emoji: '✨',
      title: 'Удивите одной доброй деталью',
      description: 'Сделайте для партнёра что-то небольшое, опираясь на один из его сегодняшних ответов.',
    },
  ],
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function getRelationshipAction(tone: ResultTone, seed: string): RelationshipAction {
  const choices = ACTIONS[tone];
  return choices[hashSeed(seed) % choices.length];
}
