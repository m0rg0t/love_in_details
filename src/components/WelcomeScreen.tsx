import React from 'react';
import { Panel, Button } from '@vkontakte/vkui';
import { Icon24MagicWandOutline } from '@vkontakte/icons';
import { useImagePrompts } from '../hooks/useImagePrompts';
import { DEFAULT_COUPLE_PROMPT_ID } from '../utils/imagePrompts';

interface WelcomeScreenProps {
  id: string;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ id, onStart }) => {
  const { openImagePrompt } = useImagePrompts();

  return (
    <Panel id={id}>
      <div className="welcome">
        <div className="welcome__emoji">💕</div>
        <h1 className="welcome__title">Любовь в деталях</h1>
        <p className="welcome__subtitle">Парный квиз для двоих на одном устройстве</p>

        <div className="welcome__rules stagger-children">
          <div className="welcome__rule">
            <span className="welcome__rule-emoji">✍️</span>
            <span>Отвечайте честно — правильных ответов нет</span>
          </div>
          <div className="welcome__rule">
            <span className="welcome__rule-emoji">📱</span>
            <span>После первого участника передайте телефон партнёру</span>
          </div>
          <div className="welcome__rule">
            <span className="welcome__rule-emoji">💬</span>
            <span>В конце вы увидите, где совпадаете, а где различаетесь</span>
          </div>
        </div>

        <Button
          size="l"
          className="gradient-button welcome__start-button"
          onClick={onStart}
        >
          Начать
        </Button>

        <div className="welcome__prompt-link">
          <Button
            size="m"
            mode="secondary"
            before={<Icon24MagicWandOutline />}
            onClick={() => void openImagePrompt(DEFAULT_COUPLE_PROMPT_ID, 'welcome')}
            className="welcome__prompts-button"
          >
            Идеи для фото вдвоём
          </Button>
          <span className="welcome__prompt-note">Love is…, кино и яркие стили</span>
        </div>
      </div>
    </Panel>
  );
};
