export const IMAGE_PROMPTS_APP_ID = 54717058;

export interface CuratedPromptIdea {
  id: string;
  title: string;
  emoji: string;
  description: string;
  visual: 'comic' | 'neon' | 'cinema';
}

export const CURATED_PROMPT_IDEAS: readonly CuratedPromptIdea[] = [
  {
    id: 'template-z8cj56690d0195r',
    title: 'В стиле Love is…',
    emoji: '💞',
    description: 'Тёплая рисованная история о вас двоих',
    visual: 'comic',
  },
  {
    id: 'template-23bp63d18sr0205',
    title: 'Неоновая любовь',
    emoji: '🌃',
    description: 'Сияющий ночной кадр с атмосферой города',
    visual: 'neon',
  },
  {
    id: 'template-3nah63271xr9wp3',
    title: 'Любовный кинопостер',
    emoji: '🎬',
    description: 'Кинематографичная обложка вашей истории',
    visual: 'cinema',
  },
] as const;

export const DEFAULT_COUPLE_PROMPT_ID = CURATED_PROMPT_IDEAS[0].id;

export function buildImagePromptsLocation(promptId: string): string {
  return `/prompt?prompt=${encodeURIComponent(promptId)}`;
}

export function buildImagePromptsUrl(promptId: string): string {
  return `https://vk.ru/app${IMAGE_PROMPTS_APP_ID}#${buildImagePromptsLocation(promptId)}`;
}
