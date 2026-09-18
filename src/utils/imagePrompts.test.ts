import { describe, expect, it } from 'vitest';
import {
  choosePromptPreview,
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

  it('keeps every preview collection non-empty and unique', () => {
    for (const idea of CURATED_PROMPT_IDEAS) {
      const sources = idea.previewImages.map((preview) => preview.src);

      expect(sources.length).toBeGreaterThan(0);
      expect(new Set(sources).size).toBe(sources.length);
    }
  });

  it('selects a preview using the supplied random value', () => {
    const previews = CURATED_PROMPT_IDEAS[1].previewImages;

    expect(choosePromptPreview(previews, 0)).toBe(previews[0]);
    expect(choosePromptPreview(previews, 0.999)).toBe(previews[1]);
  });
});
