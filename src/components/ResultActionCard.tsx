import React from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon24CheckCircleOutline } from '@vkontakte/icons';
import type { RelationshipAction } from '../utils/relationshipActions';

interface ResultActionCardProps {
  action: RelationshipAction;
  completed: boolean;
  onComplete: () => void;
}

export const ResultActionCard: React.FC<ResultActionCardProps> = ({
  action,
  completed,
  onComplete,
}) => (
  <section
    className={`result-action${completed ? ' result-action--completed' : ''}`}
    aria-labelledby="result-action-title"
  >
    <div className="result-action__visual" aria-hidden="true">
      <span>{completed ? '✓' : action.emoji}</span>
    </div>
    <div className="result-action__copy">
      <span className="results-section__eyebrow">
        {completed ? 'Ваш момент сохранён' : 'Попробуйте сегодня'}
      </span>
      <h2 id="result-action-title">{completed ? 'Вы сделали это вместе' : action.title}</h2>
      <p>
        {completed
          ? 'Отметка появилась в локальной истории. Можно возвращаться за новым вопросом завтра.'
          : action.description}
      </p>
    </div>
    <Button
      size="l"
      mode={completed ? 'secondary' : 'primary'}
      className={completed ? 'result-action__button' : 'gradient-button result-action__button'}
      before={completed ? <Icon24CheckCircleOutline /> : undefined}
      disabled={completed}
      onClick={onComplete}
    >
      {completed ? 'Сделано' : 'Сделали 💞'}
    </Button>
  </section>
);
