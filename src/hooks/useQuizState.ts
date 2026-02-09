import { useReducer } from 'react';
import type { QuizState, QuizAction } from '../types';

const initialState: QuizState = {
  panel: 'welcome',
  currentQuestion: 0,
  answersA: {},
  answersB: {},
  playerLabel: 'A',
  results: null,
  stats: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return { ...state, panel: 'quiz-a', currentQuestion: 0, playerLabel: 'A' };

    case 'ANSWER_QUESTION': {
      const key = state.playerLabel === 'A' ? 'answersA' : 'answersB';
      return {
        ...state,
        [key]: { ...state[key], [action.questionId]: action.answer },
      };
    }

    case 'NEXT_QUESTION':
      return { ...state, currentQuestion: state.currentQuestion + 1 };

    case 'FINISH_PLAYER_A':
      return { ...state, panel: 'handoff' };

    case 'START_PLAYER_B':
      return { ...state, panel: 'quiz-b', currentQuestion: 0, playerLabel: 'B' };

    case 'FINISH_QUIZ':
      return { ...state, panel: 'results', results: action.results, stats: action.stats };

    case 'RESTART':
      return { ...initialState };

    default:
      return state;
  }
}

export function useQuizState() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return { state, dispatch };
}
