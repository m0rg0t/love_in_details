import { useCallback } from 'react';
import { vkBridgeService } from '../services/vkBridge';
import { isVKBridge } from '../utils/platform';
import {
  IMAGE_PROMPTS_APP_ID,
  buildImagePromptsLocation,
  buildImagePromptsUrl,
} from '../utils/imagePrompts';
import { trackOpenImagePrompts, type PromptOpenSource } from '../utils/analytics';

function openStandalone(url: string): void {
  const openedWindow = window.open(url, '_blank');
  if (openedWindow) {
    openedWindow.opener = null;
    return;
  }

  window.location.assign(url);
}

export function useImagePrompts() {
  const openImagePrompt = useCallback(async (promptId: string, source: PromptOpenSource) => {
    if (isVKBridge()) {
      try {
        await vkBridgeService.openApp(
          IMAGE_PROMPTS_APP_ID,
          buildImagePromptsLocation(promptId),
        );
        trackOpenImagePrompts(promptId, source, true);
        return;
      } catch (error) {
        console.warn('[Image prompts] VK app handoff failed, opening web link:', error);
      }
    }

    openStandalone(buildImagePromptsUrl(promptId));
    trackOpenImagePrompts(promptId, source, true);
  }, []);

  return { openImagePrompt };
}
