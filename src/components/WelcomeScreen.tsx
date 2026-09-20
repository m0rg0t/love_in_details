import React from 'react';
import { Panel, Button } from '@vkontakte/vkui';
import {
  Icon24ArrowRightOutline,
  Icon24HistoryBackwardOutline,
  Icon24MagicWandOutline,
  Icon24PaletteOutline,
  Icon28CalendarOutline,
  Icon28HistoryBackwardOutline,
} from '@vkontakte/icons';
import { getQuizLabel } from '../data/questionPacks';
import { useImagePrompts } from '../hooks/useImagePrompts';
import { DEFAULT_COUPLE_PROMPT_ID } from '../utils/imagePrompts';
import type { SessionHistoryEntry } from '../utils/sessionHistory';
import type { WeeklyTheme } from '../utils/weeklyTheme';
import type { PanelId, PlayerLabel, QuestionPackId, QuizMode } from '../types';
import { WeeklyThemeCard } from './WeeklyThemeCard';

export interface ResumeQuizSummary {
  mode: QuizMode;
  panel: PanelId;
  playerLabel: PlayerLabel;
  currentQuestion: number;
  totalQuestions: number;
  packId: QuestionPackId | null;
}

interface WelcomeScreenProps {
  id: string;
  resume: ResumeQuizSummary | null;
  latestSession: SessionHistoryEntry | null;
  historyCount: number;
  weeklyTheme: WeeklyTheme;
  weeklyThemeCompleted: boolean;
  onResume: () => void;
  onStartDaily: () => void;
  onStartFull: () => void;
  onOpenPacks: () => void;
  onOpenHistory: () => void;
  onStartWeeklyTheme: () => void;
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
  latestSession,
  historyCount,
  weeklyTheme,
  weeklyThemeCompleted,
  onResume,
  onStartDaily,
  onStartFull,
  onOpenPacks,
  onOpenHistory,
  onStartWeeklyTheme,
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
                {getQuizLabel(resume.mode, resume.packId)} · прогресс сохранён
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

        {!resume && latestSession && (
          <section className="welcome-card welcome-return" aria-labelledby="welcome-return-title">
            <div className="welcome-card__icon welcome-return__icon" aria-hidden="true">
              <Icon28HistoryBackwardOutline />
            </div>
            <div className="welcome-card__copy">
              <span className="welcome-card__eyebrow">С возвращением</span>
              <h2 id="welcome-return-title">Ваша история продолжается</h2>
              <p>
                Последний результат: {getQuizLabel(latestSession.mode, latestSession.packId)} ·{' '}
                {latestSession.matchCount} из {latestSession.totalQuestions} совпали
              </p>
            </div>
            <Button
              size="m"
              mode="secondary"
              className="welcome-card__button"
              before={<Icon24HistoryBackwardOutline />}
              onClick={onOpenHistory}
            >
              Посмотреть историю · {historyCount}
            </Button>
          </section>
        )}

        <WeeklyThemeCard
          theme={weeklyTheme}
          completed={weeklyThemeCompleted}
          isSecondary={Boolean(resume)}
          onStart={onStartWeeklyTheme}
        />

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
            mode="secondary"
            className="welcome-card__button welcome-daily__button"
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

        <div className={`welcome__explore${historyCount > 0 ? ' welcome__explore--with-history' : ''}`}>
          <Button
            size="l"
            mode="secondary"
            before={<Icon24PaletteOutline />}
            onClick={onOpenPacks}
          >
            Выбрать тему
          </Button>
          {historyCount > 0 && (
            <Button
              size="l"
              mode="secondary"
              before={<Icon24HistoryBackwardOutline />}
              onClick={onOpenHistory}
            >
              История
            </Button>
          )}
        </div>

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
