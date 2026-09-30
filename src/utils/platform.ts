import { initializeVKBridge, isVKBridgeAvailable } from '../services/vkBridge';
import { platformContext, VK_APP_ID } from './platformPolicy';
export { withTimeout } from './timeout';

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

export const APP_ID = Number(VK_APP_ID);

export function getAppLink(): string | null {
  return platformContext.appLink;
}
