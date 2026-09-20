import React from 'react';
import { Button, Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui';
import { Icon24ArrowRightOutline } from '@vkontakte/icons';
import { questionPacks } from '../data/questionPacks';
import type { QuestionPackId } from '../types';

interface PacksScreenProps {
  id: string;
  onBack: () => void;
  onStart: (packId: QuestionPackId) => void;
}

export const PacksScreen: React.FC<PacksScreenProps> = ({ id, onBack, onStart }) => (
  <Panel id={id}>
    <PanelHeader before={<PanelHeaderBack aria-label="Назад" onClick={onBack} />}>
      Темы для двоих
    </PanelHeader>
    <main className="retention-screen packs-screen">
      <header className="retention-intro">
        <span className="retention-intro__eyebrow">Выберите настроение</span>
        <h1>О чём поговорим сегодня?</h1>
        <p>В каждом наборе шесть новых вопросов. Отвечайте по очереди на одном устройстве.</p>
      </header>

      <div className="pack-grid">
        {questionPacks.map((pack, index) => (
          <article
            key={pack.id}
            className={`pack-card pack-card--${pack.accent}`}
          >
            <div className="pack-card__visual" aria-hidden="true">
              <img
                src={pack.imageSrc}
                alt=""
                className="pack-card__image"
                style={{ objectPosition: pack.imagePosition }}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span className="pack-card__image-shade" />
            </div>
            <div className="pack-card__body">
              <span className="pack-card__eyebrow">{pack.eyebrow}</span>
              <h2>{pack.title}</h2>
              <p>{pack.description}</p>
              <div className="pack-card__meta">
                <span>6 вопросов</span>
                <span aria-hidden="true">·</span>
                <span>{pack.duration}</span>
              </div>
              <Button
                size="l"
                mode="secondary"
                after={<Icon24ArrowRightOutline />}
                className="pack-card__button"
                onClick={() => onStart(pack.id)}
              >
                Начать тему
              </Button>
            </div>
          </article>
        ))}
      </div>

      <p className="retention-note">Ответы остаются только на этом устройстве и не попадают в историю.</p>
    </main>
  </Panel>
);
