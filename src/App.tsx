import React, { useCallback, useEffect } from 'react';
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
import { trackAppStart, trackQuizStart, trackPlayerSwitch, trackQuizComplete, trackRestart } from './utils/analytics';
import { checkVKBridge, isVKBridge } from './utils/platform';
import { isDebugMode, getDebugPanel, getDebugState } from './utils/debugMode';
import type { PanelId, Answer } from './types';

const App: React.FC = () => {
  const appearance = useAppearance();
  const { state, dispatch } = useQuizState();
  const { showInterstitialAd, showBannerAd } = useVKAds();

  const setActivePanel = useCallback((panel: PanelId) => {
    if (panel === 'welcome') {
      dispatch({ type: 'RESTART' });
    }
  }, [dispatch]);

  const { pushPanel } = useBackButton({
    activePanel: state.panel,
    defaultPanel: 'welcome',
    setActivePanel,
  });

  useEffect(() => {
    checkVKBridge().then(() => {
      trackAppStart(isVKBridge() ? 'vk' : 'standalone');
    });
  }, []);

  // Debug mode: populate state with mock data for screenshots
  useEffect(() => {
    if (import.meta.env.DEV && isDebugMode()) {
      const debugState = getDebugState();

      // Start quiz if on quiz panel
      if (debugState.panel === 'quiz-a' || debugState.panel === 'quiz-b') {
        dispatch({ type: 'START_QUIZ' });

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

  const handleStart = useCallback(() => {
    dispatch({ type: 'START_QUIZ' });
    pushPanel('quiz-a');
    trackQuizStart();
  }, [dispatch, pushPanel]);

  const handleAnswer = useCallback((questionId: string, answer: Answer) => {
    dispatch({ type: 'ANSWER_QUESTION', questionId, answer });
  }, [dispatch]);

  const handleNext = useCallback(() => {
    const isLastQuestion = state.currentQuestion >= questions.length - 1;

    if (isLastQuestion && state.playerLabel === 'A') {
      dispatch({ type: 'FINISH_PLAYER_A' });
      pushPanel('handoff');
      showInterstitialAd();
      trackPlayerSwitch();
    } else if (isLastQuestion && state.playerLabel === 'B') {
      const { results, stats } = compareAnswers(state.answersA, state.answersB, questions);
      dispatch({ type: 'FINISH_QUIZ', results, stats });
      pushPanel('results');
      showBannerAd();
      trackQuizComplete(stats.matchCount, stats.totalQuestions);
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [state.currentQuestion, state.playerLabel, state.answersA, state.answersB, dispatch, pushPanel, showInterstitialAd, showBannerAd]);

  const handleHandoffReady = useCallback(() => {
    dispatch({ type: 'START_PLAYER_B' });
    pushPanel('quiz-b');
  }, [dispatch, pushPanel]);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' });
    pushPanel('welcome');
    trackRestart();
  }, [dispatch, pushPanel]);

  const currentAnswers = state.playerLabel === 'A' ? state.answersA : state.answersB;

  // Debug mode: override active panel
  const activePanel = (import.meta.env.DEV && isDebugMode())
    ? getDebugPanel() ?? state.panel
    : state.panel;

  return (
    <ConfigProvider colorScheme={appearance ?? undefined}>
      <AdaptivityProvider>
        <AppRoot>
          <VKInsetsProvider>
            <SplitLayout>
              <SplitCol>
                <View activePanel={activePanel}>
                  <WelcomeScreen id="welcome" onStart={handleStart} />
                  <QuizScreen
                    id="quiz-a"
                    questions={questions}
                    currentQuestion={state.currentQuestion}
                    answers={currentAnswers}
                    playerLabel={state.playerLabel}
                    onAnswer={handleAnswer}
                    onNext={handleNext}
                  />
                  <HandoffScreen id="handoff" onReady={handleHandoffReady} />
                  <QuizScreen
                    id="quiz-b"
                    questions={questions}
                    currentQuestion={state.currentQuestion}
                    answers={currentAnswers}
                    playerLabel={state.playerLabel}
                    onAnswer={handleAnswer}
                    onNext={handleNext}
                  />
                  <ResultsScreen
                    id="results"
                    results={state.results}
                    stats={state.stats}
                    answersA={state.answersA}
                    answersB={state.answersB}
                    questions={questions}
                    onRestart={handleRestart}
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
