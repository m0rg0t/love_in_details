import { describe, expect, it } from 'vitest';
import type { ShowStoryBoxOptions } from '@vkontakte/vk-bridge';
import { adaptStoryPayload, allowsStories, classifyShareResponse, resolvePlatform } from './platformPolicy';

describe('platform policy', () => {
  it('selects OK before VK markers and shares only configured public links', () => {
    const context = resolvePlatform('?vk_client=ok&vk_app_id=123&vk_platform=desktop_web_ok&sign=FAKE_SECRET#private', '987654');
    expect(context.platform).toBe('ok');
    expect(context.appLink).toBe('https://ok.ru/app/987654');
    expect(context.showVKPromotions).toBe(false);
    expect(resolvePlatform('').platform).toBe('standalone');
    expect(resolvePlatform('?vk_app_id=123').appLink).toBe('https://vk.com/app54445864');
    expect(resolvePlatform('?vk_client=ok').appLink).toBe('https://ok.ru/app/512004459603');
    expect(resolvePlatform('?vk_client=ok', '').appLink).toBeNull();
    expect(resolvePlatform('?vk_client=ok', '987?sign=secret').appLink).toBeNull();
  });

  it.each(['desktop_web', 'desktop_web_ok', 'mobile_web', 'mobile_web_ok', '', 'unknown'])('blocks OK web/unknown stories: %s', (variant) => {
    expect(allowsStories(resolvePlatform(`?vk_client=ok&vk_platform=${variant}`))).toBe(false);
  });
  it.each(['android', 'android_ok', 'iphone', 'iphone_ok', 'ipad', 'ios', 'mobile_android', 'mobile_iphone', 'mobile_ipad'])('keeps native OK story candidates: %s', (variant) => {
    expect(allowsStories(resolvePlatform(`?vk_client=ok&vk_platform=${variant}`))).toBe(true);
  });
  it('preserves VK stories', () => {
    expect(allowsStories(resolvePlatform('?vk_platform=desktop_web'))).toBe(true);
    expect(allowsStories(resolvePlatform(''))).toBe(false);
  });
  it('removes only unsupported OK fields without mutating media or VK payload', () => {
    const payload: ShowStoryBoxOptions = {
      background_type: 'image', blob: 'encoded-image',
      attachment: { text: 'open', type: 'url', url: 'https://vk.com/app54445864' },
      stickers: [{ sticker_type: 'renderable', sticker: {
        content_type: 'image', url: 'https://example.com/sticker.png',
        clickable_zones: [], can_delete: false,
      } }],
    };
    const original = structuredClone(payload);
    const adapted = adaptStoryPayload(payload, 'ok');
    expect(adapted.attachment).toBeUndefined();
    expect(adapted.blob).toBe(payload.blob);
    expect(adapted.stickers?.[0].sticker).not.toHaveProperty('clickable_zones');
    expect(adapted.stickers?.[0].sticker).toHaveProperty('can_delete', false);
    expect(payload).toEqual(original);
    expect(adaptStoryPayload(payload, 'vk')).toEqual(original);
  });
  it.each([
    [[{ type: 'link' }], 'success'], [{ type: 'post' }, 'success'], [{ result: true }, 'success'],
    [[], 'declined'], [{ type: null }, 'declined'], [[{ type: 'unknown' }], 'failed'], [{}, 'failed'], [null, 'failed'],
  ])('classifies share %j as %s', (response, outcome) => {
    expect(classifyShareResponse(response)).toBe(outcome);
  });
});
