import { useCallback, useEffect, useReducer, useState } from 'react';
import type { QuizState, QuizAction } from '../types';
import {
  clearQuizProgress,
  loadQuizProgress,
  saveQuizProgress,
  type QuizProgressSnapshot,
} from '../utils/quizProgress';

const initialState: QuizState = {
  panel: 'welcome',
  currentQuestion: 0,
  answersA: {},
  answersB: {},
  playerLabel: 'A',
  mode: 'full',
  questionIds: [],
  results: null,
  stats: null,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        panel: 'quiz-a',
        mode: action.mode,
        questionIds: action.questionIds,
      };

    case 'RESTORE_PROGRESS':
      return action.state;

    case 'ANSWER_QUESTION': {
      const key = state.playerLabel === 'A' ? 'answersA' : 'answersB';
      return {
        ...state,
        [key]: { ...state[key], [action.questionId]: action.answer },
      };
    }

    case 'NEXT_QUESTION':
      return { ...state, currentQuestion: state.currentQuestion + 1 };

    case 'PREVIOUS_QUESTION':
      return { ...state, currentQuestion: Math.max(0, state.currentQuestion - 1) };

    case 'FINISH_PLAYER_A':
      return { ...state, panel: 'handoff' };

    case 'START_PLAYER_B':
      return { ...state, panel: 'quiz-b', currentQuestion: 0, playerLabel: 'B' };

    case 'FINISH_QUIZ':
      return { ...state, panel: 'results', results: action.results, stats: action.stats };

    case 'NAVIGATE_TO_PANEL': {
      if (action.panel === 'welcome') return { ...initialState };
      const playerLabel = action.panel === 'quiz-b' || action.panel === 'results' ? 'B' : 'A';
      const isReopeningQuiz = state.panel === 'results' && action.panel !== 'results';
      return {
        ...state,
        panel: action.panel,
        playerLabel,
        results: isReopeningQuiz ? null : state.results,
        stats: isReopeningQuiz ? null : state.stats,
      };
    }

    case 'RESTART':
      return { ...initialState };

    default:
      return state;
  }
}

export function useQuizState() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [savedProgress, setSavedProgress] = useState<QuizProgressSnapshot | null>(
    () => loadQuizProgress(),
  );

  useEffect(() => {
    if (state.panel === 'quiz-a' || state.panel === 'handoff' || state.panel === 'quiz-b') {
      const snapshot = saveQuizProgress(state);
      if (snapshot) setSavedProgress(snapshot);
      return;
    }

    if (state.panel === 'results') {
      clearQuizProgress();
      setSavedProgress(null);
    }
  }, [state]);

  const resumeProgress = useCallback(() => {
    if (!savedProgress) return null;
    dispatch({ type: 'RESTORE_PROGRESS', state: savedProgress.state });
    return savedProgress.state.panel;
  }, [savedProgress]);

  const clearSavedProgress = useCallback(() => {
    clearQuizProgress();
    setSavedProgress(null);
  }, []);

  return { state, dispatch, savedProgress, resumeProgress, clearSavedProgress };
}
