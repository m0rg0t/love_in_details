import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBackButton } from './useBackButton';

describe('useBackButton', () => {
  it('normalizes stale in-app history after a document reload', () => {
    window.history.replaceState({ panel: 'quiz-a', appDepth: 1 }, '');

    renderHook(() => useBackButton({
      activePanel: 'welcome',
      defaultPanel: 'welcome',
      setActivePanel: vi.fn(),
    }));

    expect(window.history.state).toEqual({ panel: 'welcome', appDepth: 0 });
  });
});
