import React from 'react';
import { Button, Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui';
import {
  Icon24CalendarOutline,
  Icon24CheckCircleOutline,
  Icon24PaletteOutline,
} from '@vkontakte/icons';
import { getQuizLabel } from '../data/questionPacks';
import type { SessionHistoryEntry } from '../utils/sessionHistory';

interface HistoryScreenProps {
  id: string;
  entries: SessionHistoryEntry[];
  onBack: () => void;
  onStartDaily: () => void;
  onOpenPacks: () => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const TONE_LABELS: Record<SessionHistoryEntry['tone'], string> = {
  in_sync: 'Общий ритм',
  balanced: 'Дополняете друг друга',
  discovering: 'Новые открытия',
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  id,
  entries,
  onBack,
  onStartDaily,
  onOpenPacks,
}) => (
  <Panel id={id}>
    <PanelHeader before={<PanelHeaderBack aria-label="Назад" onClick={onBack} />}>
      Ваша история
    </PanelHeader>
    <main className="retention-screen history-screen">
      <header className="retention-intro">
        <span className="retention-intro__eyebrow">Только на этом устройстве</span>
        <h1>{entries.length > 0 ? 'Ваши моменты вдвоём' : 'Здесь появятся ваши результаты'}</h1>
        <p>
          {entries.length > 0
            ? 'Сохраняем дату, формат и общий итог — без ваших ответов.'
            : 'Пройдите вопросы дня или выберите тему, чтобы начать историю.'}
        </p>
      </header>

      {entries.length > 0 ? (
        <ol className="history-list">
          {entries.map((entry, index) => (
            <li key={entry.id} className={`history-card history-card--${entry.tone}`}>
              <div className="history-card__number" aria-hidden="true">
                {entries.length - index}
              </div>
              <div className="history-card__content">
                <span className="history-card__date">
                  <Icon24CalendarOutline />
                  {DATE_FORMATTER.format(new Date(entry.completedAt))}
                </span>
                <h2>{getQuizLabel(entry.mode, entry.packId)}</h2>
                <p>
                  <b>{entry.matchCount} из {entry.totalQuestions}</b> ответов совпали
                  <span aria-hidden="true"> · </span>
                  {TONE_LABELS[entry.tone]}
                </p>
                {entry.actionCompleted && (
                  <span className="history-card__done">
                    <Icon24CheckCircleOutline />
                    Совместное действие выполнено
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="history-empty" role="status">
          <span className="history-empty__emoji" aria-hidden="true">💞</span>
          <p>Первый результат станет началом вашей общей коллекции.</p>
        </div>
      )}

      <div className="history-actions">
        <Button size="l" className="gradient-button" onClick={onStartDaily}>
          Три вопроса дня
        </Button>
        <Button
          size="l"
          mode="secondary"
          before={<Icon24PaletteOutline />}
          onClick={onOpenPacks}
        >
          Выбрать тему
        </Button>
      </div>
    </main>
  </Panel>
);
