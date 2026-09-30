import bridge, { type AnyRequestMethodName, type VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge';
import { adaptStoryPayload, allowsStories, platformContext } from '../utils/platformPolicy';
import { BridgeTimeoutError, withTimeout } from '../utils/timeout';

const INIT_TIMEOUT_MS = 3000;
const SUPPORT_TIMEOUT_MS = 2000;
const REQUEST_TIMEOUT_MS = 5000;
const DIALOG_TIMEOUT_MS = 120000;
let initPromise: Promise<boolean> | null = null;
let bridgeAvailable = false;
const supportPromises = new Map<AnyRequestMethodName, Promise<boolean>>();
let interactivePending = false;

function isNativeHost(): boolean {
  if (bridge.isWebView()) return true;
  if (!bridge.isEmbedded() || platformContext.platform === 'standalone') return false;
  // The SDK treats arbitrary iframes as embedded. Require a platform parent.
  const ancestors = Array.from(window.location.ancestorOrigins ?? []);
  if (document.referrer) ancestors.push(document.referrer);
  return ancestors.some((origin) => {
    try { return /(^|\.)(vk\.com|vk\.ru|ok\.ru)$/.test(new URL(origin).hostname); }
    catch { return false; }
  });
}

/** All optional native requests share the same bounded initialization. */
export function initializeVKBridge(): Promise<boolean> {
  initPromise ??= isNativeHost()
    ? withTimeout(bridge.send('VKWebAppInit'), INIT_TIMEOUT_MS)
      .then(() => { bridgeAvailable = true; return true; })
      .catch(() => false)
    : Promise.resolve(false);
  return initPromise;
}

export function isVKBridgeAvailable(): boolean { return bridgeAvailable; }

async function supports(method: AnyRequestMethodName): Promise<boolean> {
  if (!await initializeVKBridge()) return false;
  let probe = supportPromises.get(method);
  if (!probe) {
    probe = withTimeout(bridge.supportsAsync(method), SUPPORT_TIMEOUT_MS).catch(() => false);
    supportPromises.set(method, probe);
  }
  return probe;
}

async function request<T>(method: AnyRequestMethodName, send: () => Promise<T>, timeout = REQUEST_TIMEOUT_MS): Promise<T> {
  if (!await supports(method)) throw new Error('Bridge method unavailable');
  const interactive = timeout === DIALOG_TIMEOUT_MS;
  if (interactive && interactivePending) throw new BridgeTimeoutError();
  if (interactive) interactivePending = true;
  try {
    const response = send();
    // Timing out does not dismiss a host dialog. Keep the session lock until
    // the host actually settles it, including across React remounts.
    if (interactive) void response.then(
      () => { interactivePending = false; },
      () => { interactivePending = false; },
    );
    return await withTimeout(response, timeout);
  } catch (error) {
    if (interactive && !(error instanceof BridgeTimeoutError)) interactivePending = false;
    throw error;
  }
}

export const vkBridgeService = {
  initialize: initializeVKBridge,
  isAvailable: isVKBridgeAvailable,
  supports,
  supportsStories: () => allowsStories() ? supports('VKWebAppShowStoryBox') : Promise.resolve(false),
  checkInterstitialAd: () => request('VKWebAppCheckNativeAds', () => bridge.send('VKWebAppCheckNativeAds', { ad_format: 'interstitial' })),
  showInterstitialAd: () => request('VKWebAppShowNativeAds', () => bridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' }), DIALOG_TIMEOUT_MS),
  showBannerAd: () => request('VKWebAppShowBannerAd', () => bridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom', layout_type: 'resize' })),
  hideBannerAd: () => request('VKWebAppHideBannerAd', () => bridge.send('VKWebAppHideBannerAd')),
  getConfig: () => request('VKWebAppGetConfig', () => bridge.send('VKWebAppGetConfig')),
  subscribe: (handler: VKBridgeSubscribeHandler) => bridge.subscribe(handler),
  unsubscribe: (handler: VKBridgeSubscribeHandler) => bridge.unsubscribe(handler),

  showStory: async (blob: string, link: string | null) => {
    if (!allowsStories()) throw new Error('Stories unavailable in this client');
    return request('VKWebAppShowStoryBox', () => bridge.send('VKWebAppShowStoryBox', adaptStoryPayload({
      background_type: 'image', blob,
      ...(link ? { attachment: { text: 'open', type: 'url', url: link } } : {}),
    })), DIALOG_TIMEOUT_MS);
  },
  shareApp: (link: string) => {
    if (link !== platformContext.appLink) return Promise.reject(new Error('Invalid public app link'));
    return request('VKWebAppShare', () => bridge.send('VKWebAppShare', { link }), DIALOG_TIMEOUT_MS);
  },
  supportsAddToFavorites: () => platformContext.platform === 'ok'
    ? Promise.resolve(false) : supports('VKWebAppAddToFavorites'),
  addToFavorites: () => request('VKWebAppAddToFavorites', () => bridge.send('VKWebAppAddToFavorites'), DIALOG_TIMEOUT_MS),
  openApp: (appId: number, location?: string) => request('VKWebAppOpenApp', () => bridge.send('VKWebAppOpenApp', {
    app_id: appId, ...(location ? { location } : {}),
  }), DIALOG_TIMEOUT_MS),
};
