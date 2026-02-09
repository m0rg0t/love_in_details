import React, { useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Button } from '@vkontakte/vkui';
import { Icon24ShareOutline, Icon28StoryOutline } from '@vkontakte/icons';
import type { ComparisonStats } from '../types';
import { isVKBridge } from '../utils/platform';
import { generateStoryImage } from '../utils/storyCanvas';
import { trackShare } from '../utils/analytics';

interface ShareSectionProps {
  stats: ComparisonStats;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ stats }) => {
  const isVK = isVKBridge();

  const handleShareStory = useCallback(async () => {
    try {
      const blob = await generateStoryImage(stats);
      await bridge.send('VKWebAppShowStoryBox', {
        background_type: 'image',
        blob,
      });
      trackShare('story', true);
    } catch (err) {
      console.error('[Share] Story error:', err);
      trackShare('story', false);
    }
  }, [stats]);

  const handleShareWall = useCallback(async () => {
    try {
      await bridge.send('VKWebAppShare', {
        link: `https://vk.com/app54445864`,
      });
      trackShare('wall', true);
    } catch (err) {
      console.error('[Share] Wall error:', err);
      trackShare('wall', false);
    }
  }, []);

  return (
    <div className="share-section">
      <h3 className="share-section__title">Поделиться результатом</h3>

      {isVK ? (
        <div className="share-section__buttons">
          <Button
            size="l"
            mode="outline"
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
    </div>
  );
};
