import React from 'react';
import { Panel } from '@vkontakte/vkui';

interface WelcomeScreenProps {
  id: string;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ id, onStart }) => {
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
      </div>
    </Panel>
  );
};
