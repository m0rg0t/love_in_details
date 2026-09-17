import { describe, expect, it } from 'vitest';
import {
  CURATED_PROMPT_IDEAS,
  IMAGE_PROMPTS_APP_ID,
  buildImagePromptsLocation,
  buildImagePromptsUrl,
} from './imagePrompts';

describe('image prompts integration', () => {
  it('builds the same deep-link shape consumed by the prompts app', () => {
    const promptId = 'template-z8cj56690d0195r';

    expect(buildImagePromptsLocation(promptId)).toBe(`/prompt?prompt=${promptId}`);
    expect(buildImagePromptsUrl(promptId)).toBe(
      `https://vk.ru/app${IMAGE_PROMPTS_APP_ID}#/prompt?prompt=${promptId}`,
    );
  });

  it('keeps every curated idea unique', () => {
    const ids = CURATED_PROMPT_IDEAS.map((idea) => idea.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
