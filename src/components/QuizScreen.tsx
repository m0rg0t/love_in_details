import React from 'react';
import { Panel } from '@vkontakte/vkui';
import type { Question, Answers, PlayerLabel, Answer } from '../types';
import { ProgressBar } from './ProgressBar';
import { QuestionSingle } from './QuestionSingle';
import { QuestionScale } from './QuestionScale';
import { QuestionBinary } from './QuestionBinary';
import { QuestionText } from './QuestionText';

interface QuizScreenProps {
  id: string;
  questions: Question[];
  currentQuestion: number;
  answers: Answers;
  playerLabel: PlayerLabel;
  onAnswer: (questionId: string, answer: Answer) => void;
  onNext: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  id,
  questions,
  currentQuestion,
  answers,
  playerLabel,
  onAnswer,
  onNext,
}) => {
  const question = questions[currentQuestion];
  if (!question) return null;

  const currentAnswer = answers[question.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== '';
  const isLastQuestion = currentQuestion >= questions.length - 1;

  const handleAnswer = (answer: Answer) => {
    onAnswer(question.id, answer);
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'single':
        return (
          <QuestionSingle
            question={question}
            value={currentAnswer as string | undefined}
            onChange={handleAnswer}
          />
        );
      case 'scale':
        return (
          <QuestionScale
            question={question}
            value={currentAnswer as number | undefined}
            onChange={handleAnswer}
          />
        );
      case 'binary':
        return (
          <QuestionBinary
            question={question}
            value={currentAnswer as string | undefined}
            onChange={handleAnswer}
          />
        );
      case 'text':
        return (
          <QuestionText
            question={question}
            value={currentAnswer as string | undefined}
            onChange={handleAnswer}
          />
        );
    }
  };

  return (
    <Panel id={id}>
      <div className="quiz">
        <div className="quiz__header">
          <ProgressBar current={currentQuestion} total={questions.length} />
          <p className="quiz__block-label">Участник {playerLabel === 'A' ? '1' : '2'} · {question.blockLabel}</p>
          <h2 className="quiz__question-text">{question.text}</h2>
        </div>

        <div className="quiz__content animate-fade-in" key={question.id}>
          {renderQuestion()}
        </div>

        <div className="quiz__footer">
          <button
            className="gradient-button"
            onClick={onNext}
            disabled={!isAnswered}
          >
            {isLastQuestion ? 'Завершить' : 'Далее'}
          </button>
        </div>
      </div>
    </Panel>
  );
};
