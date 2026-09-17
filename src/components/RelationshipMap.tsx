import React from 'react';
import {
  Icon24ClockOutline,
  Icon24CompassOutline,
  Icon24FavoriteOutline,
  Icon24MessageHeartOutline,
} from '@vkontakte/icons';
import type { ComparisonResult, Question, QuestionBlock } from '../types';
import { getBlockPortrait } from '../utils/resultPresentation';

interface RelationshipMapProps {
  results: ComparisonResult[];
  questions: Question[];
}

const NODE_POSITIONS: Record<QuestionBlock, { x: number; y: number }> = {
  support: { x: 74, y: 58 },
  communication: { x: 246, y: 58 },
  time: { x: 74, y: 202 },
  direction: { x: 246, y: 202 },
};

function BlockIcon({ block }: { block: QuestionBlock }) {
  if (block === 'support') return <Icon24FavoriteOutline />;
  if (block === 'communication') return <Icon24MessageHeartOutline />;
  if (block === 'time') return <Icon24ClockOutline />;
  return <Icon24CompassOutline />;
}

export const RelationshipMap: React.FC<RelationshipMapProps> = ({ results, questions }) => {
  const portrait = getBlockPortrait(results, questions);

  return (
    <section className="results-section relationship-map" aria-labelledby="relationship-map-title">
      <div className="results-section__heading relationship-map__heading">
        <span className="results-section__eyebrow">Карта вашей пары</span>
        <h2 id="relationship-map-title">Как складываются ваши ответы</h2>
        <p>Это не оценка совместимости, а снимок тем, в которых вы уже совпадаете или можете стать ближе.</p>
      </div>

      <div className="relationship-map__content">
        <div className="relationship-map__visual" aria-hidden="true">
          <svg viewBox="0 0 320 260" focusable="false">
            <circle className="relationship-map__halo" cx="160" cy="130" r="67" />
            {portrait.map((item) => {
              const position = NODE_POSITIONS[item.block];
              return (
                <g key={item.block}>
                  <path
                    className={`relationship-map__line relationship-map__line--${item.state}`}
                    d={`M160 130 Q${(160 + position.x) / 2} ${(130 + position.y) / 2 - 12} ${position.x} ${position.y}`}
                  />
                  <circle
                    className={`relationship-map__node relationship-map__node--${item.state}`}
                    cx={position.x}
                    cy={position.y}
                    r="16"
                  />
                  <circle className="relationship-map__node-core" cx={position.x} cy={position.y} r="5" />
                </g>
              );
            })}
            <circle className="relationship-map__center relationship-map__center--one" cx="144" cy="130" r="34" />
            <circle className="relationship-map__center relationship-map__center--two" cx="176" cy="130" r="34" />
            <path className="relationship-map__heart" d="M151 127 C151 116 165 113 168 124 C172 113 186 117 185 128 C184 139 168 147 168 147 C168 147 152 138 151 127Z" />
          </svg>
        </div>

        <div className="relationship-map__list">
          {portrait.map((item) => (
            <article className={`relationship-map__item relationship-map__item--${item.state}`} key={item.block}>
              <span className="relationship-map__item-icon" aria-hidden="true">
                <BlockIcon block={item.block} />
              </span>
              <div>
                <div className="relationship-map__item-title">
                  <h3>{item.label}</h3>
                  <span>{item.stateLabel}</span>
                </div>
                <p>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
