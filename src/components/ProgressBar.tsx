import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div>
      <div className="progress-bar" aria-hidden="true">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <progress
        className="visually-hidden"
        value={current + 1}
        max={total}
        aria-label={`Вопрос ${current + 1} из ${total}`}
      />
      <p className="progress-bar__text">Вопрос {current + 1} из {total}</p>
    </div>
  );
};
