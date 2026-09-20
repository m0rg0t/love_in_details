import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon24ShareOutline, Icon28StoryOutline } from '@vkontakte/icons';
import type { ComparisonStats } from '../types';
import { generateStoryImage } from '../utils/storyCanvas';
import { trackShare } from '../utils/analytics';
import { getResultPresentation } from '../utils/resultPresentation';
import { WEEKLY_THEME_IMAGE } from '../utils/weeklyTheme';
import { vkBridgeService } from '../services/vkBridge';
import { checkVKBridge, getAppLink, isVKBridge } from '../utils/platform';

interface ShareSectionProps {
  stats: ComparisonStats;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ stats }) => {
  const [isVK, setIsVK] = useState(isVKBridge);
  const [pendingShare, setPendingShare] = useState<'story' | 'link' | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const presentation = getResultPresentation(stats);

  useEffect(() => {
    void checkVKBridge().then(setIsVK);
  }, []);

  const handleShareStory = useCallback(async () => {
    if (pendingShare) return;
    setPendingShare('story');
    setStatus(null);
    try {
      const blob = await generateStoryImage(stats);
      const result = await vkBridgeService.showStory(blob, getAppLink());
      const success = result.result === true;
      trackShare('story', success);
      setStatus(success ? 'Редактор истории открыт — добавьте свой штрих и публикуйте.' : null);
    } catch {
      trackShare('story', false);
      setStatus('Не получилось открыть историю. Попробуйте ещё раз внутри приложения VK.');
    } finally {
      setPendingShare(null);
    }
  }, [pendingShare, stats]);

  const handleShareLink = useCallback(async () => {
    if (pendingShare) return;
    setPendingShare('link');
    setStatus(null);
    try {
      const result = await vkBridgeService.shareApp(getAppLink());
      const success = result.length > 0;
      trackShare('link', success);
      setStatus(success ? 'Ссылка отправлена.' : null);
    } catch {
      trackShare('link', false);
      setStatus('Не получилось открыть отправку. Результат и ответы останутся на месте.');
    } finally {
      setPendingShare(null);
    }
  }, [pendingShare]);

  return (
    <section className="share-section" aria-labelledby="share-section-title">
      <div
        className="share-card-preview"
        role="img"
        aria-label={`Карточка результата: ${presentation.title}`}
      >
        <img src={WEEKLY_THEME_IMAGE} alt="" aria-hidden="true" loading="eager" decoding="async" />
        <div className="share-card-preview__shade" />
        <span className="share-card-preview__brand">Любовь в деталях</span>
        <div className="share-card-preview__copy">
          <span>Наш ритм вдвоём</span>
          <strong>{presentation.title}</strong>
          <small>А какой ритм у вас?</small>
        </div>
      </div>

      <div className="share-section__content">
        <div className="share-section__copy">
          <span className="results-section__eyebrow">Поделитесь настроением</span>
          <h2 id="share-section-title" className="share-section__title">Карточка без личных ответов</h2>
          <p>Только настроение вашей пары и приглашение пройти квиз — детали останутся между вами.</p>
        </div>

        {isVK ? (
          <div className="share-section__buttons">
            <Button
              size="l"
              className="gradient-button share-section__story-button"
              before={<Icon28StoryOutline />}
              loading={pendingShare === 'story'}
              disabled={pendingShare !== null}
              onClick={() => void handleShareStory()}
            >
              В историю
            </Button>
            <Button
              size="l"
              mode="secondary"
              before={<Icon24ShareOutline />}
              loading={pendingShare === 'link'}
              disabled={pendingShare !== null}
              onClick={() => void handleShareLink()}
            >
              Отправить ссылку
            </Button>
          </div>
        ) : (
          <p className="share-section__note">
            Публикация откроется при запуске приложения внутри VK
          </p>
        )}

        {status && <p className="share-section__status" role="status">{status}</p>}
      </div>
    </section>
  );
};
