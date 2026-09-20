import React from 'react';
import { View } from '@vkontakte/vkui';
import type {
  Answer,
  Answers,
  ComparisonResult,
  ComparisonStats,
  PanelId,
  PlayerLabel,
  Question,
  QuestionPackId,
  QuizMode,
} from '../types';
import type { ResultTone } from '../utils/resultPresentation';
import type { SessionHistoryEntry } from '../utils/sessionHistory';
import type { WeeklyTheme } from '../utils/weeklyTheme';
import { WelcomeScreen, type ResumeQuizSummary } from './WelcomeScreen';
import { PacksScreen } from './PacksScreen';
import { HistoryScreen } from './HistoryScreen';
import { QuizScreen } from './QuizScreen';
import { HandoffScreen } from './HandoffScreen';
import { ResultsScreen } from './ResultsScreen';

interface AppPanelsProps {
  activePanel: PanelId;
  resume: ResumeQuizSummary | null;
  historyEntries: SessionHistoryEntry[];
  weeklyTheme: WeeklyTheme;
  weeklyThemeCompleted: boolean;
  questions: Question[];
  currentQuestion: number;
  currentAnswers: Answers;
  playerLabel: PlayerLabel;
  mode: QuizMode;
  modeLabel: string;
  results: ComparisonResult[] | null;
  stats: ComparisonStats | null;
  resultsSessionKey: string;
  activeHistoryEntry: SessionHistoryEntry | null;
  onResume: () => void;
  onStart: (mode: QuizMode, packId?: QuestionPackId | null) => void;
  onOpenPacks: () => void;
  onOpenHistory: () => void;
  onStartWeeklyTheme: () => void;
  onPanelBack: () => void;
  onAnswer: (questionId: string, answer: Answer) => void;
  onPrevious: () => void;
  onNext: () => void;
  onHandoffReady: () => void;
  onRestart: () => void;
  onRevealDetails: () => Promise<unknown>;
  onActionComplete: (actionId: string, tone: ResultTone) => void;
}

export const AppPanels: React.FC<AppPanelsProps> = ({
  activePanel,
  resume,
  historyEntries,
  weeklyTheme,
  weeklyThemeCompleted,
  questions,
  currentQuestion,
  currentAnswers,
  playerLabel,
  mode,
  modeLabel,
  results,
  stats,
  resultsSessionKey,
  activeHistoryEntry,
  onResume,
  onStart,
  onOpenPacks,
  onOpenHistory,
  onStartWeeklyTheme,
  onPanelBack,
  onAnswer,
  onPrevious,
  onNext,
  onHandoffReady,
  onRestart,
  onRevealDetails,
  onActionComplete,
}) => (
  <View activePanel={activePanel}>
    <WelcomeScreen
      id="welcome"
      resume={resume}
      latestSession={historyEntries[0] ?? null}
      historyCount={historyEntries.length}
      weeklyTheme={weeklyTheme}
      weeklyThemeCompleted={weeklyThemeCompleted}
      onResume={onResume}
      onStartDaily={() => onStart('daily')}
      onStartFull={() => onStart('full')}
      onOpenPacks={onOpenPacks}
      onOpenHistory={onOpenHistory}
      onStartWeeklyTheme={onStartWeeklyTheme}
    />
    <PacksScreen
      id="packs"
      onBack={onPanelBack}
      onStart={(packId) => onStart('pack', packId)}
    />
    <HistoryScreen
      id="history"
      entries={historyEntries}
      onBack={onPanelBack}
      onStartDaily={() => onStart('daily')}
      onOpenPacks={onOpenPacks}
    />
    <QuizScreen
      id="quiz-a"
      questions={questions}
      currentQuestion={currentQuestion}
      answers={currentAnswers}
      playerLabel={playerLabel}
      mode={mode}
      modeLabel={modeLabel}
      onAnswer={onAnswer}
      onPrevious={onPrevious}
      onNext={onNext}
    />
    <HandoffScreen id="handoff" onReady={onHandoffReady} />
    <QuizScreen
      id="quiz-b"
      questions={questions}
      currentQuestion={currentQuestion}
      answers={currentAnswers}
      playerLabel={playerLabel}
      mode={mode}
      modeLabel={modeLabel}
      onAnswer={onAnswer}
      onPrevious={onPrevious}
      onNext={onNext}
    />
    <ResultsScreen
      key={resultsSessionKey}
      id="results"
      results={results}
      stats={stats}
      questions={questions}
      sessionSeed={activeHistoryEntry?.id ?? resultsSessionKey}
      initialActionCompleted={activeHistoryEntry?.actionCompleted ?? false}
      onRestart={onRestart}
      onRevealDetails={onRevealDetails}
      onActionComplete={onActionComplete}
    />
  </View>
);
