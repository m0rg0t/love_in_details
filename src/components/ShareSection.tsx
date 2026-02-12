import React, { useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Button } from '@vkontakte/vkui';
import { Icon24ShareOutline, Icon28StoryOutline, Icon24GiftOutline } from '@vkontakte/icons';
import type { ComparisonStats } from '../types';
import { generateStoryImage } from '../utils/storyCanvas';
import { trackShare } from '../utils/analytics';
import { useOtredach } from '../hooks/useOtredach';

interface ShareSectionProps {
  stats: ComparisonStats;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ stats }) => {
  const { openOtredach, isVK } = useOtredach();

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
            before={<Icon24GiftOutline />}
            onClick={openOtredach}
          >
            Создать открытку
          </Button>
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
          Функции «Поделиться» и «Создать открытку» доступны при запуске внутри VK
        </p>
      )}
    </div>
  );
};
