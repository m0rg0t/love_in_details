import { afterEach, describe, expect, it, vi } from 'vitest';
import { initializeAnalytics, sanitizeReferrer, trackAppStart, trackShare } from './analytics';

afterEach(() => { delete window.umami; vi.restoreAllMocks(); });
describe('analytics privacy', () => {
  it('removes credentials, query/hash and non-HTTP referrers', () => {
    expect(sanitizeReferrer('https://user:password@ok.ru/app/123?sign=FAKE_SECRET#token')).toBe('https://ok.ru/app/123');
    expect(sanitizeReferrer('javascript:secret')).toBe('');
  });
  it('uses explicit clean payloads on page views and all custom events', () => {
    window.history.replaceState({}, '', '/?vk_client=ok&sign=FAKE_SECRET#PRIVATE');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://ok.ru/app/123?token=REFERRER_SECRET#PRIVATE');
    const track = vi.fn();
    window.umami = { track };
    initializeAnalytics();
    trackAppStart('ok');
    trackShare('link', true);
    expect(track).toHaveBeenCalledTimes(3);
    for (const [payload] of track.mock.calls) {
      expect(payload.url).toBe('/');
      expect(payload.referrer).toBe('https://ok.ru/app/123');
      expect(JSON.stringify(payload)).not.toMatch(/FAKE_SECRET|REFERRER_SECRET|PRIVATE/);
    }
    expect(track.mock.calls[1][0].data.mode).toBe('ok');
  });
  it('flushes startup events after a delayed tracker load', () => {
    const script = document.createElement('script');
    script.id = 'umami-script';
    document.body.append(script);
    initializeAnalytics();
    trackAppStart('ok');
    const track = vi.fn();
    window.umami = { track };
    script.dispatchEvent(new Event('load'));
    expect(track).toHaveBeenCalledTimes(2);
    expect(track.mock.calls[1][0].name).toBe('app_start');
    expect(track.mock.calls[1][0].data.mode).toBe('ok');
    script.remove();
  });

});
