import { initializeVKBridge, isVKBridgeAvailable } from '../services/vkBridge';

let didLogMode = false;

export async function checkVKBridge(): Promise<boolean> {
  const isVK = await initializeVKBridge();
  if (!didLogMode) {
    console.log(`[Platform] Mode: ${isVK ? 'VK Bridge' : 'Standalone'}`);
    didLogMode = true;
  }
  return isVK;
}

export function isVKBridge(): boolean {
  return isVKBridgeAvailable();
}

export const APP_ID = 54445864;

export function getAppLink(): string {
  return `https://vk.com/app${APP_ID}`;
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out',
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}
