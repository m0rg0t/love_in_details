import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
} from '@vkontakte/vkui';
import { useAppearance } from '@vkontakte/vk-bridge-react';
import '@vkontakte/vkui/dist/vkui.css';
import './styles/index.css';

import { VKInsetsProvider } from './components/VKInsetsProvider';
import { AppPanels } from './components/AppPanels';
import { useQuizState } from './hooks/useQuizState';
import { useSessionHistory } from './hooks/useSessionHistory';
import { useBackButton } from './hooks/useBackButton';
import { useVKAds } from './hooks/useVKAds';
import { questions } from './data/questions';
import { allQuestions, getQuestionPack, getQuizLabel } from './data/questionPacks';
import { compareAnswers } from './utils/comparison';
import { getResultPresentation, type ResultTone } from './utils/resultPresentation';
import { getDailyQuestions } from './utils/dailyQuestions';
import {
  trackAppStart,
  trackQuizStart,
  trackQuizResume,
  trackPlayerSwitch,
  trackQuizComplete,
  trackRestart,
  trackHistoryOpen,
  trackPackStart,
  trackPacksOpen,
  trackResultActionComplete,
} from './utils/analytics';
import { checkVKBridge } from './utils/platform';
import { isDebugMode, getDebugPanel, getDebugState } from './utils/debugMode';
import type { PanelId, Answer, QuestionPackId, QuizMode } from './types';

const App: React.FC = () => {
  const appearance = useAppearance();
  const {
    state,
    dispatch,
    savedProgress,
    resumeProgress,
    clearSavedProgress,
  } = useQuizState();
  const { entries: historyEntries, recordSession, completeAction } = useSessionHistory();
  const { showInterstitialAd, showBannerAd, hideBannerAd } = useVKAds();
  const startupHandledRef = useRef(false);
  const completionHandledRef = useRef(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const setActivePanel = useCallback((panel: PanelId) => {
    if (panel === 'welcome') {
      completionHandledRef.current = false;
      setActiveHistoryId(null);
      dispatch({ type: 'RESTART' });
      return;
    }
    if (panel === 'quiz-b') {
      completionHandledRef.current = false;
      setActiveHistoryId(null);
    }
    dispatch({ type: 'NAVIGATE_TO_PANEL', panel });
  }, [dispatch]);

  const { pushPanel } = useBackButton({
    activePanel: state.panel,
    defaultPanel: 'welcome',
    setActivePanel,
  });

  useEffect(() => {
    if (startupHandledRef.current) return;
    startupHandledRef.current = true;

    void checkVKBridge().then((isVK) => {
      trackAppStart(isVK ? 'vk' : 'standalone', Boolean(savedProgress));
      if (isVK) void showBannerAd();
    });
  }, [savedProgress, showBannerAd]);

  // Debug mode: populate state with mock data for screenshots
  useEffect(() => {
    if (import.meta.env.DEV && isDebugMode()) {
      const debugState = getDebugState();

      // Start quiz if on quiz panel
      if (debugState.panel === 'quiz-a' || debugState.panel === 'quiz-b') {
        dispatch({
          type: 'START_QUIZ',
          mode: 'full',
          questionIds: questions.map((question) => question.id),
        });

        // Navigate to the correct question by dispatching NEXT_QUESTION
        for (let i = 0; i < debugState.currentQuestion; i++) {
          dispatch({ type: 'NEXT_QUESTION' });
        }
      }

      // Populate Player A answers
      Object.entries(debugState.answersA).forEach(([qId, answer]) => {
        dispatch({ type: 'ANSWER_QUESTION', questionId: qId, answer });
      });

      // Switch to Player B if needed
      if (debugState.panel === 'quiz-b') {
        dispatch({ type: 'START_PLAYER_B' });

        // Navigate to the correct question for player B
        for (let i = 0; i < debugState.currentQuestion; i++) {
          dispatch({ type: 'NEXT_QUESTION' });
        }
      }

      // Populate Player B answers
      Object.entries(debugState.answersB).forEach(([qId, answer]) => {
        dispatch({ type: 'ANSWER_QUESTION', questionId: qId, answer });
      });

      // Finish quiz with results if on results panel
      if (debugState.panel === 'results') {
        dispatch({ type: 'FINISH_QUIZ', results: debugState.results!, stats: debugState.stats! });
      }
    }
  }, [dispatch]);

  const activeQuestions = useMemo(() => {
    if (state.questionIds.length === 0) return questions;
    const questionsById = new Map(allQuestions.map((question) => [question.id, question]));
    const selected = state.questionIds.flatMap((id) => {
      const question = questionsById.get(id);
      return question ? [question] : [];
    });
    return selected.length === state.questionIds.length ? selected : questions;
  }, [state.questionIds]);

  const handleStart = useCallback((mode: QuizMode, packId: QuestionPackId | null = null) => {
    const pack = mode === 'pack' ? getQuestionPack(packId) : null;
    if (mode === 'pack' && !pack) return;
    const selectedQuestions = mode === 'daily'
      ? getDailyQuestions(questions)
      : pack?.questions ?? questions;
    completionHandledRef.current = false;
    setActiveHistoryId(null);
    clearSavedProgress();
    dispatch({
      type: 'START_QUIZ',
      mode,
      packId,
      questionIds: selectedQuestions.map((question) => question.id),
    });
    pushPanel('quiz-a');
    trackQuizStart(mode, packId);
    if (packId) trackPackStart(packId);
  }, [clearSavedProgress, dispatch, pushPanel]);

  const handleResume = useCallback(() => {
    if (!savedProgress) return;
    completionHandledRef.current = false;
    setActiveHistoryId(null);
    const panel = resumeProgress();
    if (!panel) return;
    pushPanel(panel);
    trackQuizResume(savedProgress.state.mode, panel);
  }, [pushPanel, resumeProgress, savedProgress]);

  const handleAnswer = useCallback((questionId: string, answer: Answer) => {
    dispatch({ type: 'ANSWER_QUESTION', questionId, answer });
  }, [dispatch]);

  const handleNext = useCallback(() => {
    const isLastQuestion = state.currentQuestion >= activeQuestions.length - 1;

    if (isLastQuestion && state.playerLabel === 'A') {
      dispatch({ type: 'FINISH_PLAYER_A' });
      pushPanel('handoff');
      trackPlayerSwitch();
    } else if (isLastQuestion && state.playerLabel === 'B') {
      if (completionHandledRef.current) return;
      completionHandledRef.current = true;
      const { results, stats } = compareAnswers(state.answersA, state.answersB, activeQuestions);
      const historyEntry = recordSession({
        mode: state.mode,
        packId: state.packId,
        matchCount: stats.matchCount,
        totalQuestions: stats.totalQuestions,
        tone: getResultPresentation(stats).tone,
      });
      setActiveHistoryId(historyEntry.id);
      dispatch({ type: 'FINISH_QUIZ', results, stats });
      pushPanel('results');
      trackQuizComplete(stats.matchCount, stats.totalQuestions, state.mode);
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [
    activeQuestions,
    state.currentQuestion,
    state.playerLabel,
    state.answersA,
    state.answersB,
    state.mode,
    state.packId,
    dispatch,
    pushPanel,
    recordSession,
  ]);

  const handlePrevious = useCallback(() => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  }, [dispatch]);

  const handleHandoffReady = useCallback(() => {
    dispatch({ type: 'START_PLAYER_B' });
    pushPanel('quiz-b');
  }, [dispatch, pushPanel]);

  const handleRestart = useCallback(() => {
    const completedMode = state.mode;
    completionHandledRef.current = false;
    setActiveHistoryId(null);
    clearSavedProgress();
    dispatch({ type: 'RESTART' });
    pushPanel('welcome');
    hideBannerAd(); // Hide banner ad when restarting
    trackRestart(completedMode);
  }, [clearSavedProgress, dispatch, pushPanel, hideBannerAd, state.mode]);

  const handleOpenPacks = useCallback(() => {
    dispatch({ type: 'NAVIGATE_TO_PANEL', panel: 'packs' });
    pushPanel('packs');
    trackPacksOpen();
  }, [dispatch, pushPanel]);

  const handleOpenHistory = useCallback(() => {
    dispatch({ type: 'NAVIGATE_TO_PANEL', panel: 'history' });
    pushPanel('history');
    trackHistoryOpen(historyEntries.length);
  }, [dispatch, historyEntries.length, pushPanel]);

  const handlePanelBack = useCallback(() => {
    if ((Number(window.history.state?.appDepth) || 0) > 0) {
      window.history.back();
      return;
    }
    setActivePanel('welcome');
  }, [setActivePanel]);

  const handleActionComplete = useCallback((actionId: string, tone: ResultTone) => {
    if (activeHistoryId) completeAction(activeHistoryId);
    trackResultActionComplete(actionId, tone);
  }, [activeHistoryId, completeAction]);

  const currentAnswers = state.playerLabel === 'A' ? state.answersA : state.answersB;

  // Debug mode: override active panel
  const activePanel = (import.meta.env.DEV && isDebugMode())
    ? getDebugPanel() ?? state.panel
    : state.panel;

  const resumeSummary = savedProgress
    ? {
        mode: savedProgress.state.mode,
        panel: savedProgress.state.panel,
        playerLabel: savedProgress.state.playerLabel,
        currentQuestion: savedProgress.state.currentQuestion,
        totalQuestions: savedProgress.state.questionIds.length,
        packId: savedProgress.state.packId,
      }
    : null;
  const resultsSessionKey = state.results
    ? `results-${activeHistoryId ?? state.mode}-${state.results.map((result) => result.questionId).join('-')}`
    : 'results-empty';
  const activeHistoryEntry = activeHistoryId
    ? historyEntries.find((entry) => entry.id === activeHistoryId) ?? null
    : null;
  const modeLabel = getQuizLabel(state.mode, state.packId);

  return (
    <ConfigProvider colorScheme={appearance ?? undefined}>
      <AdaptivityProvider>
        <AppRoot>
          <VKInsetsProvider>
            <SplitLayout>
              <SplitCol>
                <AppPanels
                  activePanel={activePanel}
                  resume={resumeSummary}
                  historyEntries={historyEntries}
                  questions={activeQuestions}
                  currentQuestion={state.currentQuestion}
                  currentAnswers={currentAnswers}
                  playerLabel={state.playerLabel}
                  mode={state.mode}
                  modeLabel={modeLabel}
                  results={state.results}
                  stats={state.stats}
                  resultsSessionKey={resultsSessionKey}
                  activeHistoryEntry={activeHistoryEntry}
                  onResume={handleResume}
                  onStart={handleStart}
                  onOpenPacks={handleOpenPacks}
                  onOpenHistory={handleOpenHistory}
                  onPanelBack={handlePanelBack}
                  onAnswer={handleAnswer}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onHandoffReady={handleHandoffReady}
                  onRestart={handleRestart}
                  onRevealDetails={showInterstitialAd}
                  onActionComplete={handleActionComplete}
                />
              </SplitCol>
            </SplitLayout>
          </VKInsetsProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default App;
