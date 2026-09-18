export const IMAGE_PROMPTS_APP_ID = 54717058;

export interface PromptPreviewImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  objectPosition?: string;
}

export interface CuratedPromptIdea {
  id: string;
  title: string;
  description: string;
  visual: 'comic' | 'neon' | 'cinema';
  previewImages: readonly [PromptPreviewImage, ...PromptPreviewImage[]];
}

export const CURATED_PROMPT_IDEAS: readonly CuratedPromptIdea[] = [
  {
    id: 'template-z8cj56690d0195r',
    title: 'В стиле Love is…',
    description: 'Тёплая рисованная история о вас двоих',
    visual: 'comic',
    previewImages: [
      {
        src: '/assets/prompt-ideas/love-is.webp',
        alt: 'Пример пары в мягком рисованном стиле Love is',
        width: 480,
        height: 480,
      },
    ],
  },
  {
    id: 'template-23bp63d18sr0205',
    title: 'Неоновая любовь',
    description: 'Сияющий ночной кадр с атмосферой города',
    visual: 'neon',
    previewImages: [
      {
        src: '/assets/prompt-ideas/neon-love.webp',
        alt: 'Пример пары на ночной улице в свете неонового сердца',
        width: 480,
        height: 480,
      },
      {
        src: '/assets/prompt-ideas/neon-love-2.webp',
        alt: 'Пример неонового образа на ночной улице рядом со светящимся сердцем',
        width: 480,
        height: 720,
        objectPosition: '50% 24%',
      },
    ],
  },
  {
    id: 'template-3nah63271xr9wp3',
    title: 'Любовный кинопостер',
    description: 'Кинематографичная обложка вашей истории',
    visual: 'cinema',
    previewImages: [
      {
        src: '/assets/prompt-ideas/love-movie-poster.webp',
        alt: 'Пример романтического кинокадра с парой под дождём',
        width: 480,
        height: 480,
      },
      {
        src: '/assets/prompt-ideas/love-movie-poster-2.webp',
        alt: 'Пример кинематографичного образа под дождём с букетом роз',
        width: 480,
        height: 720,
        objectPosition: '50% 27%',
      },
    ],
  },
] as const;

export function choosePromptPreview(
  previewImages: CuratedPromptIdea['previewImages'],
  randomValue = Math.random(),
): PromptPreviewImage {
  const normalizedRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;
  const index = Math.floor(normalizedRandom * previewImages.length);

  return previewImages[index] ?? previewImages[0];
}

export const DEFAULT_COUPLE_PROMPT_ID = CURATED_PROMPT_IDEAS[0].id;

export function buildImagePromptsLocation(promptId: string): string {
  return `/prompt?prompt=${encodeURIComponent(promptId)}`;
}

export function buildImagePromptsUrl(promptId: string): string {
  return `https://vk.ru/app${IMAGE_PROMPTS_APP_ID}#${buildImagePromptsLocation(promptId)}`;
}
