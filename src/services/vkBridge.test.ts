import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const sdk = vi.hoisted(() => ({
  send: vi.fn(), supportsAsync: vi.fn(), isWebView: vi.fn(), isEmbedded: vi.fn(),
  subscribe: vi.fn(), unsubscribe: vi.fn(),
}));
vi.mock('@vkontakte/vk-bridge', () => ({ default: sdk }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/?vk_app_id=54445864&vk_platform=desktop_web');
  sdk.isWebView.mockReturnValue(true);
  sdk.isEmbedded.mockReturnValue(true);
  sdk.supportsAsync.mockResolvedValue(true);
  sdk.send.mockResolvedValue({ result: true });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('Bridge platform integration', () => {
  it('initializes once and caches concurrent support probes', async () => {
    const { vkBridgeService: service } = await import('./vkBridge');
    await Promise.all([service.showBannerAd(), service.showBannerAd(), service.getConfig()]);
    expect(sdk.send.mock.calls.filter(([method]) => method === 'VKWebAppInit')).toHaveLength(1);
    expect(sdk.supportsAsync.mock.calls.filter(([method]) => method === 'VKWebAppShowBannerAd')).toHaveLength(1);
    expect(sdk.send.mock.calls[0][0]).toBe('VKWebAppInit');
    expect(sdk.send.mock.calls.some(([method]) => method === 'VKWebAppCheckBannerAd')).toBe(false);
  });
  it('does not initialize in standalone OK previews or arbitrary frames', async () => {
    sdk.isWebView.mockReturnValue(false);
    window.history.replaceState({}, '', '/?vk_client=ok');
    const { vkBridgeService: service } = await import('./vkBridge');
    expect(await service.initialize()).toBe(false);
    expect(await service.supports('VKWebAppShare')).toBe(false);
    expect(sdk.send).not.toHaveBeenCalled();
  });
  it.each(['desktop_web', 'desktop_web_ok', 'mobile_web', 'mobile_web_ok'])('ignores fake-positive story support on OK %s', async (variant) => {
    window.history.replaceState({}, '', `/?vk_client=ok&vk_platform=${variant}`);
    const { vkBridgeService: service } = await import('./vkBridge');
    expect(await service.supportsStories()).toBe(false);
    await expect(service.showStory('image', null)).rejects.toThrow('Stories unavailable');
    expect(sdk.supportsAsync).not.toHaveBeenCalled();
  });
  it('sends native OK story media without a VK attachment and hides favorites', async () => {
    window.history.replaceState({}, '', '/?vk_client=ok&vk_platform=android');
    const { vkBridgeService: service } = await import('./vkBridge');
    expect(await service.supportsStories()).toBe(true);
    await service.showStory('encoded-image', null);
    expect(sdk.send).toHaveBeenCalledWith('VKWebAppShowStoryBox', { background_type: 'image', blob: 'encoded-image' });
    expect(await service.supportsAddToFavorites()).toBe(false);
  });
  it('preserves VK story attachments', async () => {
    const { vkBridgeService: service } = await import('./vkBridge');
    await service.showStory('encoded-image', 'https://vk.com/app54445864');
    expect(sdk.send).toHaveBeenCalledWith('VKWebAppShowStoryBox', {
      background_type: 'image', blob: 'encoded-image',
      attachment: { text: 'open', type: 'url', url: 'https://vk.com/app54445864' },
    });
  });
  it('rejects signed/foreign share links', async () => {
    const { vkBridgeService: service } = await import('./vkBridge');
    await expect(service.shareApp('https://example.com/?sign=FAKE_SECRET')).rejects.toThrow('Invalid public app link');
    expect(sdk.send).not.toHaveBeenCalled();
  });
  it('bounds stuck initialization', async () => {
    vi.useFakeTimers();
    sdk.send.mockReturnValue(new Promise(() => {}));
    const { vkBridgeService: service } = await import('./vkBridge');
    const result = service.initialize();
    await vi.advanceTimersByTimeAsync(3001);
    expect(await result).toBe(false);
  });
  it('bounds stuck support without sending an optional request', async () => {
    vi.useFakeTimers();
    sdk.supportsAsync.mockReturnValue(new Promise(() => {}));
    const { vkBridgeService: service } = await import('./vkBridge');
    const result = service.supports('VKWebAppShowBannerAd');
    await vi.advanceTimersByTimeAsync(2001);
    expect(await result).toBe(false);
    expect(sdk.send).toHaveBeenCalledTimes(1);
  });
  it('does not show banners when the host reports no support', async () => {
    sdk.supportsAsync.mockResolvedValue(false);
    const { vkBridgeService: service } = await import('./vkBridge');
    await expect(service.showBannerAd()).rejects.toThrow('unavailable');
    expect(sdk.send.mock.calls.some(([method]) => method === 'VKWebAppShowBannerAd')).toBe(false);
  });
  it('keeps timed-out native dialogs locked until the host actually settles', async () => {
    vi.useFakeTimers();
    const { vkBridgeService: service } = await import('./vkBridge');
    await service.initialize();
    await service.supports('VKWebAppShare');
    let settle: ((value: { result: boolean }) => void) | undefined;
    sdk.send.mockImplementation((method) => method === 'VKWebAppShare'
      ? new Promise((resolve) => { settle = resolve; }) : Promise.resolve({ result: true }));
    const result = service.shareApp('https://vk.com/app54445864');
    const rejection = expect(result).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(120001);
    await rejection;
    await expect(service.shareApp('https://vk.com/app54445864')).rejects.toThrow('timed out');
    expect(sdk.send.mock.calls.filter(([method]) => method === 'VKWebAppShare')).toHaveLength(1);
    settle?.({ result: true });
    await vi.advanceTimersByTimeAsync(0);
    sdk.send.mockResolvedValue({ result: true });
    await expect(service.shareApp('https://vk.com/app54445864')).resolves.toEqual({ result: true });
  });

  it('handles init and support rejection as unavailable', async () => {
    sdk.send.mockRejectedValue(new Error('init failed'));
    let service = (await import('./vkBridge')).vkBridgeService;
    expect(await service.initialize()).toBe(false);
    expect(await service.supports('VKWebAppShare')).toBe(false);
    vi.resetModules();
    sdk.send.mockResolvedValue({ result: true });
    sdk.supportsAsync.mockRejectedValue(new Error('support failed'));
    service = (await import('./vkBridge')).vkBridgeService;
    expect(await service.supports('VKWebAppShare')).toBe(false);
  });

});
