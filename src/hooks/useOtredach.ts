import { useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { isVKBridge } from '../utils/platform';
import { trackOpenOtredach } from '../utils/analytics';

const OTREDACH_APP_ID = 54160489;
const VALENTINE_TAG = 'День святого Валентина';

/**
 * Hook for integrating with Otredach (VK romantic photo card creator app)
 *
 * @returns {Object} Object with openOtredach function and isVK flag
 *
 * @example
 * const { openOtredach, isVK } = useOtredach();
 *
 * {isVK && (
 *   <Button onClick={openOtredach}>
 *     Создать открытку
 *   </Button>
 * )}
 */
export function useOtredach() {
  const isVK = isVKBridge();

  const openOtredach = useCallback(async () => {
    const encodedTag = encodeURIComponent(VALENTINE_TAG);
    const location = `all_templates?tag=${encodedTag}`;

    try {
      await bridge.send('VKWebAppOpenApp', {
        app_id: OTREDACH_APP_ID,
        location,
      });
      trackOpenOtredach(true);
    } catch (err) {
      console.error('[Otredach] Open error:', err);
      trackOpenOtredach(false);

      // Fallback для standalone режима
      if (!isVKBridge()) {
        const url = `https://vk.com/app${OTREDACH_APP_ID}#/${location}`;
        window.open(url, '_blank');
      }
    }
  }, []);

  return { openOtredach, isVK };
}
