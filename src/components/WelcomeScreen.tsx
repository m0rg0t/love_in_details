import React from 'react';
import { Panel, Button } from '@vkontakte/vkui';
import { Icon24GiftOutline } from '@vkontakte/icons';
import { useOtredach } from '../hooks/useOtredach';

interface WelcomeScreenProps {
  id: string;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ id, onStart }) => {
  const { openOtredach, isVK } = useOtredach();

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

        <button className="gradient-button welcome__start-button" onClick={onStart}>
          Начать
        </button>

        {isVK && (
          <Button
            size="l"
            mode="secondary"
            before={<Icon24GiftOutline />}
            onClick={openOtredach}
            className="welcome__otredach-button"
          >
            Создать романтическое фото
          </Button>
        )}
      </div>
    </Panel>
  );
};
