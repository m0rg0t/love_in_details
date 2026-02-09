import React from 'react';
import { Panel } from '@vkontakte/vkui';

interface HandoffScreenProps {
  id: string;
  onReady: () => void;
}

export const HandoffScreen: React.FC<HandoffScreenProps> = ({ id, onReady }) => {
  return (
    <Panel id={id}>
      <div className="handoff">
        <div className="handoff__emoji">🤝</div>
        <h2 className="handoff__title">Передайте телефон партнёру</h2>
        <p className="handoff__subtitle">
          Ответы первого участника сохранены и скрыты до финального результата
        </p>
        <button className="gradient-button handoff__button" onClick={onReady}>
          Готово, начинаем!
        </button>
      </div>
    </Panel>
  );
};
