import { useState, useCallback } from 'react';
import bridge, {
  BannerAdLayoutType,
  BannerAdLocation,
  EAdsFormats,
} from '@vkontakte/vk-bridge';
import { isVKBridge, checkVKBridge } from '../utils/platform';

export function useVKAds() {
  const [bannerVisible, setBannerVisible] = useState(false);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    await checkVKBridge();
    if (!isVKBridge()) return false;
    try {
      const result = await bridge.send('VKWebAppShowNativeAds', {
        ad_format: EAdsFormats.INTERSTITIAL,
      });
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
      const result = await bridge.send('VKWebAppShowBannerAd', {
        banner_location: BannerAdLocation.BOTTOM,
        layout_type: BannerAdLayoutType.RESIZE,
      });
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
    try {
      await bridge.send('VKWebAppHideBannerAd');
      setBannerVisible(false);
      return true;
    } catch (err) {
      console.error('[Ads] Hide banner error:', err);
      return false;
    }
  }, []);

  return { bannerVisible, showInterstitialAd, showBannerAd, hideBannerAd };
}
