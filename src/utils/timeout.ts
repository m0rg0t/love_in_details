export class BridgeTimeoutError extends Error {
  constructor() { super('Bridge operation timed out'); }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(errorMessage ? new Error(errorMessage) : new BridgeTimeoutError()), timeoutMs);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
