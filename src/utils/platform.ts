import bridge from '@vkontakte/vk-bridge';

let _isVKBridge: boolean | null = null;

export async function checkVKBridge(): Promise<boolean> {
  if (_isVKBridge !== null) return _isVKBridge;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 1000)
    );
    await Promise.race([
      bridge.send('VKWebAppGetClientVersion'),
      timeout,
    ]);
    _isVKBridge = true;
  } catch {
    _isVKBridge = false;
  }
  console.log(`[Platform] Mode: ${_isVKBridge ? 'VK Bridge' : 'Standalone'}`);
  return _isVKBridge;
}

export function isVKBridge(): boolean {
  return _isVKBridge ?? false;
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
