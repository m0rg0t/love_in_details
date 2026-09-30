import type { ShowStoryBoxOptions } from '@vkontakte/vk-bridge';

export type AppPlatform = 'vk' | 'ok' | 'standalone';
export const VK_APP_ID = '54445864';
export const OK_APP_ID = '512004459603';
const OK_WEB_CLIENTS = new Set(['desktop_web', 'desktop_web_ok', 'mobile_web', 'mobile_web_ok']);
const SHARE_TYPES = new Set(['message', 'post', 'story', 'qr', 'link', 'other']);

export function resolvePlatform(search: string, okAppId = OK_APP_ID) {
  const params = new URLSearchParams(search);
  const platform: AppPlatform = params.get('vk_client') === 'ok' ? 'ok'
    : params.has('vk_platform') || params.has('vk_app_id') ? 'vk' : 'standalone';
  return {
    platform,
    clientPlatform: params.get('vk_platform') ?? '',
    appLink: platform === 'ok'
      ? /^[1-9]\d*$/.test(okAppId) ? `https://ok.ru/app/${okAppId}` : null
      : `https://vk.com/app${VK_APP_ID}`,
    showVKPromotions: platform !== 'ok',
  };
}

export const platformContext = resolvePlatform(window.location.search);

export function allowsStories(context = platformContext): boolean {
  if (context.platform === 'standalone') return false;
  if (context.platform !== 'ok') return true;
  // Unknown OK variants are not evidence of a native story editor.
  return !OK_WEB_CLIENTS.has(context.clientPlatform)
    && /^(mobile_)?(android|iphone|ipad|ios)(_|$)/.test(context.clientPlatform);
}

export function adaptStoryPayload(payload: ShowStoryBoxOptions, platform = platformContext.platform): ShowStoryBoxOptions {
  if (platform !== 'ok') return { ...payload };
  const { attachment: _attachment, ...adapted } = payload;
  if (payload.stickers) {
    adapted.stickers = payload.stickers.map((entry) => {
      if (entry.sticker_type !== 'renderable') return entry;
      const { clickable_zones: _zones, ...sticker } = entry.sticker;
      return { ...entry, sticker };
    });
  }
  return adapted;
}

export type ShareOutcome = 'success' | 'declined' | 'failed';
export function classifyShareResponse(data: unknown): ShareOutcome {
  const hasType = (item: unknown) => typeof item === 'object' && item !== null
    && 'type' in item && typeof item.type === 'string' && SHARE_TYPES.has(item.type);
  if (Array.isArray(data)) {
    if (!data.length) return 'declined';
    return data.some(hasType) ? 'success' : 'failed';
  }
  if (typeof data !== 'object' || data === null) return 'failed';
  if ('type' in data && data.type === null) return 'declined';
  return hasType(data) || ('result' in data && data.result === true) ? 'success' : 'failed';
}
