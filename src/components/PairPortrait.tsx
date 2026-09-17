import React from 'react';
import type { ResultTone } from '../utils/resultPresentation';

interface PairPortraitProps {
  tone: ResultTone;
}

const TONE_DISTANCE: Record<ResultTone, number> = {
  in_sync: 72,
  balanced: 90,
  discovering: 108,
};

export const PairPortrait: React.FC<PairPortraitProps> = ({ tone }) => {
  const distance = TONE_DISTANCE[tone];
  const leftCenter = 170 - distance / 2;
  const rightCenter = 170 + distance / 2;

  return (
    <div className={`pair-portrait pair-portrait--${tone}`} aria-hidden="true">
      <svg viewBox="0 0 340 270" focusable="false">
        <defs>
          <linearGradient id="portrait-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd5e4" />
            <stop offset="100%" stopColor="#ff87b2" />
          </linearGradient>
          <linearGradient id="portrait-right" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#bda8ff" />
            <stop offset="100%" stopColor="#f5ddff" />
          </linearGradient>
        </defs>

        <circle className="pair-portrait__orbit pair-portrait__orbit--outer" cx="170" cy="135" r="112" />
        <circle className="pair-portrait__orbit pair-portrait__orbit--inner" cx="170" cy="135" r="86" />

        <g className="pair-portrait__person pair-portrait__person--left">
          <circle cx={leftCenter} cy="124" r="67" fill="url(#portrait-left)" />
          <circle cx={leftCenter - 16} cy="108" r="22" className="pair-portrait__face" />
          <path
            d={`M ${leftCenter - 48} 174 C ${leftCenter - 42} 138, ${leftCenter + 18} 136, ${leftCenter + 40} 178`}
            className="pair-portrait__figure-line"
          />
        </g>

        <g className="pair-portrait__person pair-portrait__person--right">
          <circle cx={rightCenter} cy="142" r="67" fill="url(#portrait-right)" />
          <circle cx={rightCenter + 16} cy="126" r="22" className="pair-portrait__face" />
          <path
            d={`M ${rightCenter - 40} 196 C ${rightCenter - 18} 154, ${rightCenter + 42} 156, ${rightCenter + 48} 192`}
            className="pair-portrait__figure-line"
          />
        </g>

        <path
          className="pair-portrait__connection"
          d="M153 137 C153 120 174 116 178 132 C184 116 205 122 204 139 C202 156 179 168 179 168 C179 168 155 155 153 137Z"
        />

        <circle className="pair-portrait__spark pair-portrait__spark--one" cx="48" cy="72" r="5" />
        <circle className="pair-portrait__spark pair-portrait__spark--two" cx="292" cy="58" r="8" />
        <circle className="pair-portrait__spark pair-portrait__spark--three" cx="300" cy="214" r="4" />
        <path className="pair-portrait__star" d="M64 204 L69 216 L81 221 L69 226 L64 238 L59 226 L47 221 L59 216Z" />
      </svg>

    </div>
  );
};
