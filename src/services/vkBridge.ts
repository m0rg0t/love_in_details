import bridge, { type VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge';

const INIT_TIMEOUT_MS = 3000;

let initPromise: Promise<boolean> | null = null;
let bridgeAvailable: boolean | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('VK Bridge initialization timed out'));
    }, timeoutMs);

    promise.then(resolve, reject).finally(() => window.clearTimeout(timer));
  });
}

/**
 * Initializes VK Bridge once and caches the detected runtime mode.
 * VKWebAppInit must be the first Bridge call in a real VK client.
 */
export function initializeVKBridge(): Promise<boolean> {
  initPromise ??= withTimeout(bridge.send('VKWebAppInit'), INIT_TIMEOUT_MS)
    .then(() => {
      bridgeAvailable = true;
      return true;
    })
    .catch(() => {
      bridgeAvailable = false;
      return false;
    });

  return initPromise;
}

export function isVKBridgeAvailable(): boolean {
  return bridgeAvailable === true;
}

export const vkBridgeService = {
  initialize: initializeVKBridge,
  isAvailable: isVKBridgeAvailable,

  checkInterstitialAd: () => bridge.send('VKWebAppCheckNativeAds', {
    ad_format: 'interstitial',
  }),

  showInterstitialAd: () => bridge.send('VKWebAppShowNativeAds', {
    ad_format: 'interstitial',
  }),

  showBannerAd: () => bridge.send('VKWebAppShowBannerAd', {
    banner_location: 'bottom',
    layout_type: 'resize',
  }),

  hideBannerAd: () => bridge.send('VKWebAppHideBannerAd'),
  getConfig: () => bridge.send('VKWebAppGetConfig'),
  subscribe: (handler: VKBridgeSubscribeHandler) => bridge.subscribe(handler),
  unsubscribe: (handler: VKBridgeSubscribeHandler) => bridge.unsubscribe(handler),

  showStory: (blob: string) => bridge.send('VKWebAppShowStoryBox', {
    background_type: 'image',
    blob,
  }),

  shareApp: (link: string) => bridge.send('VKWebAppShare', { link }),

  openApp: (appId: number, location?: string) => bridge.send('VKWebAppOpenApp', {
    app_id: appId,
    ...(location ? { location } : {}),
  }),
};
