import { useState, useCallback } from 'react';
import { isVKBridge, checkVKBridge } from '../utils/platform';
import { vkBridgeService } from '../services/vkBridge';
import { trackAdShow } from '../utils/analytics';

export function useVKAds() {
  const [bannerVisible, setBannerVisible] = useState(false);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    await checkVKBridge();
    if (!isVKBridge()) return false;
    try {
      const availability = await vkBridgeService.checkInterstitialAd();
      if (!availability.result) {
        trackAdShow('interstitial', false);
        return false;
      }
      const result = await vkBridgeService.showInterstitialAd();
      trackAdShow('interstitial', result.result);
      return result.result;
    } catch (err) {
      console.error('[Ads] Interstitial error:', err);
      trackAdShow('interstitial', false);
      return false;
    }
  }, []);

  const showBannerAd = useCallback(async (): Promise<boolean> => {
    await checkVKBridge();
    if (!isVKBridge()) return false;
    try {
      const result = await vkBridgeService.showBannerAd();
      trackAdShow('banner', result.result);
      if (result.result) {
        setBannerVisible(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Ads] Banner error:', err);
      trackAdShow('banner', false);
      return false;
    }
  }, []);

  const hideBannerAd = useCallback(async (): Promise<boolean> => {
    if (!isVKBridge()) return false;
    try {
      await vkBridgeService.hideBannerAd();
      setBannerVisible(false);
      return true;
    } catch (err) {
      console.error('[Ads] Hide banner error:', err);
      return false;
    }
  }, []);

  return { bannerVisible, showInterstitialAd, showBannerAd, hideBannerAd };
}
