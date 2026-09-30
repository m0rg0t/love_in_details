import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { vkBridgeService } from '../services/vkBridge';
import { trackShare } from '../utils/analytics';
import { generateStoryImage } from '../utils/storyCanvas';
import { ShareSection } from './ShareSection';

vi.mock('../utils/platform', () => ({
  checkVKBridge: vi.fn(),
  getAppLink: () => 'https://vk.com/app54445864',
  isVKBridge: () => false,
}));

vi.mock('../services/vkBridge', () => ({
  vkBridgeService: {
    supportsStories: vi.fn(),
    supports: vi.fn(),
    showStory: vi.fn(),
    shareApp: vi.fn(),
  },
}));

vi.mock('../utils/storyCanvas', () => ({
  generateStoryImage: vi.fn(),
}));

vi.mock('../utils/analytics', () => ({
  trackShare: vi.fn(),
}));

const stats = {
  matchCount: 4,
  softDiffCount: 1,
  dialogueCount: 1,
  totalQuestions: 6,
  summaryMessage: 'Тест',
};

const mockedBridgeService = vi.mocked(vkBridgeService);
const mockedGenerateStoryImage = vi.mocked(generateStoryImage);
const mockedTrackShare = vi.mocked(trackShare);

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('ShareSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedBridgeService.supportsStories.mockResolvedValue(true);
    mockedBridgeService.supports.mockResolvedValue(true);
    mockedGenerateStoryImage.mockResolvedValue('data:image/jpeg;base64,story');
    mockedBridgeService.showStory.mockResolvedValue({ result: true });
    mockedBridgeService.shareApp.mockResolvedValue([{ type: 'link' }]);
  });

  it('opens a private result card in VK Stories with a return link', async () => {
    render(<ShareSection stats={stats} />);

    fireEvent.click(await screen.findByRole('button', { name: 'В историю' }));

    await waitFor(() => expect(mockedBridgeService.showStory).toHaveBeenCalledWith(
      'data:image/jpeg;base64,story',
      'https://vk.com/app54445864',
    ));
    expect(mockedTrackShare).toHaveBeenCalledWith('story', true);
    expect(screen.queryByRole('status')?.textContent).toContain('Редактор истории открыт');
  });

  it('shares only the public app link through VKWebAppShare', async () => {
    render(<ShareSection stats={stats} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Отправить ссылку' }));

    await waitFor(() => expect(mockedBridgeService.shareApp).toHaveBeenCalledWith(
      'https://vk.com/app54445864',
    ));
    expect(mockedTrackShare).toHaveBeenCalledWith('link', true);
  });

  it('fails open when the story editor is declined', async () => {
    mockedBridgeService.showStory.mockRejectedValue({ error_type: 'client_error', error_data: { error_code: 4 } });
    render(<ShareSection stats={stats} />);

    fireEvent.click(await screen.findByRole('button', { name: 'В историю' }));

    await waitFor(() => expect(mockedTrackShare).toHaveBeenCalledWith('story', false));
    expect(screen.queryByRole('status')).toBeNull();
    expect(mockedTrackShare).toHaveBeenCalledWith('story', false);
    expect(screen.queryByRole('button', { name: 'Копировать приглашение' })).toBeNull();
  });

  it('keeps browser sharing usable without a native host', async () => {
    mockedBridgeService.supportsStories.mockResolvedValue(false);
    mockedBridgeService.supports.mockResolvedValue(false);
    render(<ShareSection stats={stats} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Отправить ссылку' }));
    expect(await screen.findByRole('button', { name: 'Копировать приглашение' })).not.toBeNull();
    expect(mockedBridgeService.shareApp).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/Карточка результата/)).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'В историю' })).toBeNull();
  });
  it('offers manual sharing for malformed native responses', async () => {
    mockedBridgeService.shareApp.mockResolvedValue([{ type: 'unexpected' }] as never);
    render(<ShareSection stats={stats} />);
    await waitFor(() => expect(mockedBridgeService.supports).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Отправить ссылку' }));
    expect(await screen.findByRole('button', { name: 'Копировать приглашение' })).not.toBeNull();
    expect(screen.getByLabelText('Приглашение без личных ответов').textContent).toContain('https://vk.com/app54445864');
    expect(mockedTrackShare).toHaveBeenCalledWith('link', false);
  });

  it('keeps empty share response cancellation quiet', async () => {
    mockedBridgeService.shareApp.mockResolvedValue([]);
    render(<ShareSection stats={stats} />);
    await waitFor(() => expect(mockedBridgeService.supports).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Отправить ссылку' }));
    await waitFor(() => expect(mockedTrackShare).toHaveBeenCalledWith('link', false));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Копировать приглашение' })).toBeNull();
  });

});
