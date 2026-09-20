import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkVKBridge } from '../utils/platform';
import { vkBridgeService } from '../services/vkBridge';
import { useAddToFavorites } from './useAddToFavorites';

vi.mock('../utils/platform', () => ({
  checkVKBridge: vi.fn(),
}));

vi.mock('../services/vkBridge', () => ({
  vkBridgeService: {
    supportsAddToFavorites: vi.fn(),
    addToFavorites: vi.fn(),
  },
}));

const mockedCheckVKBridge = vi.mocked(checkVKBridge);
const mockedBridgeService = vi.mocked(vkBridgeService);

describe('useAddToFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCheckVKBridge.mockResolvedValue(true);
    mockedBridgeService.supportsAddToFavorites.mockResolvedValue(true);
    mockedBridgeService.addToFavorites.mockResolvedValue({ result: true });
  });

  it('hides the action when the VK method is unavailable', async () => {
    mockedBridgeService.supportsAddToFavorites.mockResolvedValue(false);

    const { result } = renderHook(() => useAddToFavorites());

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.isAvailable).toBe(false);
  });

  it('adds the app to favorites and keeps a success state', async () => {
    const { result } = renderHook(() => useAddToFavorites());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    let added = false;
    await act(async () => {
      added = await result.current.addToFavorites();
    });

    expect(added).toBe(true);
    expect(mockedBridgeService.addToFavorites).toHaveBeenCalledOnce();
    expect(result.current.isAdded).toBe(true);
  });

  it('fails open when the VK client declines the request', async () => {
    mockedBridgeService.addToFavorites.mockRejectedValue(new Error('declined'));
    const { result } = renderHook(() => useAddToFavorites());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    let added = true;
    await act(async () => {
      added = await result.current.addToFavorites();
    });

    expect(added).toBe(false);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isAdding).toBe(false);
  });
});
