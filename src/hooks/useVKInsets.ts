import { useState, useEffect, useCallback } from 'react';
import bridge, { VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge';
import { isVKBridge, checkVKBridge } from '../utils/platform';

export interface VKInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const ZERO_INSETS: VKInsets = { top: 0, bottom: 0, left: 0, right: 0 };

export function useVKInsets(): VKInsets {
  const [insets, setInsets] = useState<VKInsets>(ZERO_INSETS);

  const handleInsets = useCallback((newInsets: Partial<VKInsets> | undefined) => {
    if (!newInsets) return;
    setInsets({
      top: newInsets.top ?? 0,
      bottom: newInsets.bottom ?? 0,
      left: newInsets.left ?? 0,
      right: newInsets.right ?? 0,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await checkVKBridge();
      if (!isVKBridge() || !mounted) return;

      const handleEvent: VKBridgeSubscribeHandler = (event) => {
        if (!mounted) return;
        const { type, data } = event.detail;
        if (type === 'VKWebAppUpdateConfig') {
          const configData = data as { insets?: VKInsets };
          if (configData.insets) handleInsets(configData.insets);
        } else if (type === 'VKWebAppUpdateInsets') {
          const insetsData = data as { insets: VKInsets };
          handleInsets(insetsData.insets);
        }
      };

      bridge.subscribe(handleEvent);

      try {
        const config = await bridge.send('VKWebAppGetConfig');
        const configWithInsets = config as { insets?: VKInsets };
        if (mounted && configWithInsets.insets) handleInsets(configWithInsets.insets);
      } catch (error) {
        console.warn('[useVKInsets] Failed to get initial config:', error);
      }

      return () => { bridge.unsubscribe(handleEvent); };
    }

    const cleanup = init();
    return () => {
      mounted = false;
      cleanup.then((unsub) => unsub?.());
    };
  }, [handleInsets]);

  return insets;
}
