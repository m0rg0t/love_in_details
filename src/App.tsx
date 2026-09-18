import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ConfigProvider,
  AdaptivityProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
} from '@vkontakte/vkui';
import { useAppearance } from '@vkontakte/vk-bridge-react';
import '@vkontakte/vkui/dist/vkui.css';
import './styles/index.css';

import { VKInsetsProvider } from './components/VKInsetsProvider';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { HandoffScreen } from './components/HandoffScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { useQuizState } from './hooks/useQuizState';
import { useBackButton } from './hooks/useBackButton';
import { useVKAds } from './hooks/useVKAds';
import { questions } from './data/questions';
import { compareAnswers } from './utils/comparison';
import { getDailyQuestions } from './utils/dailyQuestions';
import {
  trackAppStart,
  trackQuizStart,
  trackQuizResume,
  trackPlayerSwitch,
  trackQuizComplete,
  trackRestart,
} from './utils/analytics';
import { checkVKBridge } from './utils/platform';
import { isDebugMode, getDebugPanel, getDebugState } from './utils/debugMode';
import type { PanelId, Answer, QuizMode } from './types';

const App: React.FC = () => {
  const appearance = useAppearance();
  const {
    state,
    dispatch,
    savedProgress,
    resumeProgress,
    clearSavedProgress,
  } = useQuizState();
  const { showInterstitialAd, showBannerAd, hideBannerAd } = useVKAds();
  const startupHandledRef = useRef(false);

  const setActivePanel = useCallback((panel: PanelId) => {
    if (panel === 'welcome') {
      dispatch({ type: 'RESTART' });
      return;
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
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const selected = state.questionIds.flatMap((id) => {
      const question = questionsById.get(id);
      return question ? [question] : [];
    });
    return selected.length === state.questionIds.length ? selected : questions;
  }, [state.questionIds]);

  const handleStart = useCallback((mode: QuizMode) => {
    const selectedQuestions = mode === 'daily' ? getDailyQuestions(questions) : questions;
    clearSavedProgress();
    dispatch({
      type: 'START_QUIZ',
      mode,
      questionIds: selectedQuestions.map((question) => question.id),
    });
    pushPanel('quiz-a');
    trackQuizStart(mode);
  }, [clearSavedProgress, dispatch, pushPanel]);

  const handleResume = useCallback(() => {
    if (!savedProgress) return;
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
      const { results, stats } = compareAnswers(state.answersA, state.answersB, activeQuestions);
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
    dispatch,
    pushPanel,
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
    clearSavedProgress();
    dispatch({ type: 'RESTART' });
    pushPanel('welcome');
    hideBannerAd(); // Hide banner ad when restarting
    trackRestart(completedMode);
  }, [clearSavedProgress, dispatch, pushPanel, hideBannerAd, state.mode]);

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
      }
    : null;
  const resultsSessionKey = state.results
    ? `results-${state.mode}-${state.results.map((result) => result.questionId).join('-')}`
    : 'results-empty';

  return (
    <ConfigProvider colorScheme={appearance ?? undefined}>
      <AdaptivityProvider>
        <AppRoot>
          <VKInsetsProvider>
            <SplitLayout>
              <SplitCol>
                <View activePanel={activePanel}>
                  <WelcomeScreen
                    id="welcome"
                    resume={resumeSummary}
                    onResume={handleResume}
                    onStartDaily={() => handleStart('daily')}
                    onStartFull={() => handleStart('full')}
                  />
                  <QuizScreen
                    id="quiz-a"
                    questions={activeQuestions}
                    currentQuestion={state.currentQuestion}
                    answers={currentAnswers}
                    playerLabel={state.playerLabel}
                    mode={state.mode}
                    onAnswer={handleAnswer}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                  />
                  <HandoffScreen id="handoff" onReady={handleHandoffReady} />
                  <QuizScreen
                    id="quiz-b"
                    questions={activeQuestions}
                    currentQuestion={state.currentQuestion}
                    answers={currentAnswers}
                    playerLabel={state.playerLabel}
                    mode={state.mode}
                    onAnswer={handleAnswer}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                  />
                  <ResultsScreen
                    key={resultsSessionKey}
                    id="results"
                    results={state.results}
                    stats={state.stats}
                    questions={activeQuestions}
                    onRestart={handleRestart}
                    onRevealDetails={showInterstitialAd}
                  />
                </View>
              </SplitCol>
            </SplitLayout>
          </VKInsetsProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default App;
