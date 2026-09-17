import { useState, useCallback } from 'react';
import { isVKBridge, checkVKBridge } from '../utils/platform';
import { vkBridgeService } from '../services/vkBridge';

export function useVKAds() {
  const [bannerVisible, setBannerVisible] = useState(false);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    await checkVKBridge();
    if (!isVKBridge()) return false;
    try {
      const result = await vkBridgeService.showInterstitialAd();
      return result.result;
    } catch (err) {
      console.error('[Ads] Interstitial error:', err);
      return false;
    }
  }, []);

  const showBannerAd = useCallback(async (): Promise<boolean> => {
    await checkVKBridge();
    if (!isVKBridge()) return false;
    try {
      const result = await vkBridgeService.showBannerAd();
      if (result.result) {
        setBannerVisible(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Ads] Banner error:', err);
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
