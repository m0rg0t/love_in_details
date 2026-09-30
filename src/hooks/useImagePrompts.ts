import { useCallback } from 'react';
import { vkBridgeService } from '../services/vkBridge';
import { platformContext } from '../utils/platformPolicy';
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
    if (!platformContext.showVKPromotions) return;
    if (isVKBridge()) {
      try {
        await vkBridgeService.openApp(
          IMAGE_PROMPTS_APP_ID,
          buildImagePromptsLocation(promptId),
        );
        trackOpenImagePrompts(promptId, source, true);
        return;
      } catch {
        console.warn('[Image prompts] App handoff failed');
      }
    }

    openStandalone(buildImagePromptsUrl(promptId));
    trackOpenImagePrompts(promptId, source, true);
  }, []);

  return { openImagePrompt };
}
