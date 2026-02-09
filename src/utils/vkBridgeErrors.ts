export function getVKBridgeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'error_data' in error) {
    const errorData = error as { error_data?: { error_reason?: string } };
    return errorData.error_data?.error_reason ?? 'Неизвестная ошибка VK Bridge';
  }
  return 'Неизвестная ошибка';
}

export function isUserCancelError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'error_data' in error) {
    const errorData = error as { error_data?: { error_code?: number; error_reason?: string } };
    return errorData.error_data?.error_code === 4 || errorData.error_data?.error_reason === 'User denied';
  }
  return false;
}
