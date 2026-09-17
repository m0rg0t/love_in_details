import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon24ShareOutline, Icon28StoryOutline } from '@vkontakte/icons';
import type { ComparisonStats } from '../types';
import { generateStoryImage } from '../utils/storyCanvas';
import { trackShare } from '../utils/analytics';
import { vkBridgeService } from '../services/vkBridge';
import { checkVKBridge, getAppLink, isVKBridge } from '../utils/platform';

interface ShareSectionProps {
  stats: ComparisonStats;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ stats }) => {
  const [isVK, setIsVK] = useState(isVKBridge);

  useEffect(() => {
    void checkVKBridge().then(setIsVK);
  }, []);

  const handleShareStory = useCallback(async () => {
    try {
      const blob = await generateStoryImage(stats);
      await vkBridgeService.showStory(blob);
      trackShare('story', true);
    } catch (err) {
      console.error('[Share] Story error:', err);
      trackShare('story', false);
    }
  }, [stats]);

  const handleShareWall = useCallback(async () => {
    try {
      await vkBridgeService.shareApp(getAppLink());
      trackShare('wall', true);
    } catch (err) {
      console.error('[Share] Wall error:', err);
      trackShare('wall', false);
    }
  }, []);

  return (
    <section className="share-section" aria-labelledby="share-section-title">
      <div className="share-section__copy">
        <span className="results-section__eyebrow">Сохраните этот момент</span>
        <h2 id="share-section-title" className="share-section__title">Ваш портрет готов для истории</h2>
        <p>Соберём вертикальную карточку с главным выводом и результатами пары.</p>
      </div>

      {isVK ? (
        <div className="share-section__buttons">
          <Button
            size="l"
            className="gradient-button share-section__story-button"
            before={<Icon28StoryOutline />}
            onClick={handleShareStory}
          >
            В историю
          </Button>
          <Button
            size="l"
            mode="outline"
            before={<Icon24ShareOutline />}
            onClick={handleShareWall}
          >
            Друзьям
          </Button>
        </div>
      ) : (
        <p className="share-section__note">
          Функция «Поделиться» доступна при запуске внутри VK
        </p>
      )}
    </section>
  );
};
