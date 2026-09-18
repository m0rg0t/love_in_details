import React from 'react';
import { Panel, Button } from '@vkontakte/vkui';
import {
  Icon24ArrowRightOutline,
  Icon24MagicWandOutline,
  Icon28CalendarOutline,
  Icon28HistoryBackwardOutline,
} from '@vkontakte/icons';
import { useImagePrompts } from '../hooks/useImagePrompts';
import { DEFAULT_COUPLE_PROMPT_ID } from '../utils/imagePrompts';
import type { PanelId, PlayerLabel, QuizMode } from '../types';

export interface ResumeQuizSummary {
  mode: QuizMode;
  panel: PanelId;
  playerLabel: PlayerLabel;
  currentQuestion: number;
  totalQuestions: number;
}

interface WelcomeScreenProps {
  id: string;
  resume: ResumeQuizSummary | null;
  onResume: () => void;
  onStartDaily: () => void;
  onStartFull: () => void;
}

function getResumeLabel(resume: ResumeQuizSummary): string {
  if (resume.panel === 'handoff') {
    return 'Первый участник уже ответил — осталось передать телефон партнёру';
  }

  const participant = resume.playerLabel === 'A' ? '1' : '2';
  return `Участник ${participant} · вопрос ${resume.currentQuestion + 1} из ${resume.totalQuestions}`;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  id,
  resume,
  onResume,
  onStartDaily,
  onStartFull,
}) => {
  const { openImagePrompt } = useImagePrompts();

  return (
    <Panel id={id}>
      <div className="welcome">
        <header className="welcome__brand">
          <div className="welcome__emoji" aria-hidden="true">💕</div>
          <h1 className="welcome__title">Любовь в деталях</h1>
          <p className="welcome__subtitle">Короткий разговор для двоих на одном устройстве</p>
        </header>

        {resume && (
          <section className="welcome-card welcome-resume" aria-labelledby="welcome-resume-title">
            <div className="welcome-card__icon welcome-resume__icon" aria-hidden="true">
              <Icon28HistoryBackwardOutline />
            </div>
            <div className="welcome-card__copy">
              <span className="welcome-card__eyebrow">
                {resume.mode === 'daily' ? 'Вопросы дня' : 'Полный квиз'} · прогресс сохранён
              </span>
              <h2 id="welcome-resume-title">Продолжим с того же места?</h2>
              <p>{getResumeLabel(resume)}</p>
            </div>
            <Button
              size="l"
              className="gradient-button welcome-card__button"
              after={<Icon24ArrowRightOutline />}
              onClick={onResume}
            >
              Продолжить
            </Button>
            <span className="welcome-resume__note">Ответы хранятся только на этом устройстве</span>
          </section>
        )}

        <section className="welcome-card welcome-daily" aria-labelledby="welcome-daily-title">
          <div className="welcome-card__icon welcome-daily__icon" aria-hidden="true">
            <Icon28CalendarOutline />
          </div>
          <div className="welcome-card__copy">
            <span className="welcome-card__eyebrow">Вопросы дня</span>
            <h2 id="welcome-daily-title">Три вопроса, чтобы стать ближе</h2>
            <p>Новая подборка каждый день · около 2 минут</p>
          </div>
          <Button
            size="l"
            mode={resume ? 'secondary' : 'primary'}
            className={resume ? 'welcome-card__button welcome-daily__button' : 'gradient-button welcome-card__button'}
            onClick={onStartDaily}
          >
            Ответить вдвоём
          </Button>
        </section>

        <Button
          size="l"
          mode="secondary"
          className="welcome__full-button"
          onClick={onStartFull}
        >
          Полный квиз · 12 вопросов
        </Button>

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
