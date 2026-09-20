import React from 'react';
import { Button } from '@vkontakte/vkui';
import {
  Icon24ArrowRightOutline,
  Icon24CheckCircleOutline,
  Icon28StarsOutline,
} from '@vkontakte/icons';
import type { WeeklyTheme } from '../utils/weeklyTheme';

interface WeeklyThemeCardProps {
  theme: WeeklyTheme;
  completed: boolean;
  isSecondary?: boolean;
  onStart: () => void;
}

export const WeeklyThemeCard: React.FC<WeeklyThemeCardProps> = ({
  theme,
  completed,
  isSecondary = false,
  onStart,
}) => (
  <section
    className={`weekly-theme${completed ? ' weekly-theme--completed' : ''}`}
    aria-labelledby="weekly-theme-title"
  >
    <div className="weekly-theme__visual" aria-hidden="true">
      <img src={theme.imageSrc} alt="" loading="eager" decoding="async" />
      <span className="weekly-theme__visual-icon">
        {completed ? <Icon24CheckCircleOutline /> : <Icon28StarsOutline />}
      </span>
    </div>
    <div className="weekly-theme__content">
      <div className="weekly-theme__meta">
        <span>{completed ? 'Пройдено на этой неделе' : 'Тема недели'}</span>
        <span aria-hidden="true">·</span>
        <time>{theme.dateLabel}</time>
      </div>
      <h2 id="weekly-theme-title">{theme.pack.title}</h2>
      <p>{theme.pack.description}</p>
      <span className="weekly-theme__duration">6 вопросов · {theme.pack.duration}</span>
      <Button
        size="l"
        mode={completed || isSecondary ? 'secondary' : 'primary'}
        className={completed || isSecondary
          ? 'weekly-theme__button'
          : 'gradient-button weekly-theme__button'}
        after={<Icon24ArrowRightOutline />}
        onClick={onStart}
      >
        {completed ? 'Пройти ещё раз' : 'Начать тему'}
      </Button>
    </div>
  </section>
);
