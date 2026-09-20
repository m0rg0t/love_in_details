import { useCallback, useEffect, useState } from 'react';
import { vkBridgeService } from '../services/vkBridge';
import { trackAddToFavorites } from '../utils/analytics';
import { checkVKBridge } from '../utils/platform';

export function useAddToFavorites() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void checkVKBridge()
      .then(async (isVK) => {
        if (!isVK) return false;
        return vkBridgeService.supportsAddToFavorites();
      })
      .then((supported) => {
        if (!cancelled) setIsAvailable(supported);
      })
      .catch(() => {
        if (!cancelled) setIsAvailable(false);
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => { cancelled = true; };
  }, []);

  const addToFavorites = useCallback(async (): Promise<boolean> => {
    if (!isAvailable || isAdding || isAdded) return isAdded;

    setIsAdding(true);
    try {
      const response = await vkBridgeService.addToFavorites();
      const success = response.result === true;
      setIsAdded(success);
      trackAddToFavorites(success);
      return success;
    } catch {
      trackAddToFavorites(false);
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [isAdded, isAdding, isAvailable]);

  return { isChecking, isAvailable, isAdding, isAdded, addToFavorites };
}
