import React from 'react';
import { Button, Caption, Text, Title } from '@vkontakte/vkui';
import { Icon24ArrowRightOutline, Icon24MagicWandOutline } from '@vkontakte/icons';
import { useImagePrompts } from '../hooks/useImagePrompts';
import { CURATED_PROMPT_IDEAS } from '../utils/imagePrompts';

export const PromptIdeasCard: React.FC = () => {
  const { openImagePrompt } = useImagePrompts();

  return (
    <section className="prompt-ideas" aria-labelledby="prompt-ideas-title">
      <div className="prompt-ideas__header">
        <div className="prompt-ideas__icon" aria-hidden="true">
          <Icon24MagicWandOutline />
        </div>
        <div>
          <Caption className="prompt-ideas__eyebrow">Продолжите вашу историю</Caption>
          <Title id="prompt-ideas-title" level="2" Component="h2" className="prompt-ideas__title">
            Примерьте новый образ вдвоём
          </Title>
        </div>
      </div>
      <Text className="prompt-ideas__text">
        Выберите готовый промпт про любовь — мы откроем его в приложении с образами.
      </Text>
      <div className="prompt-ideas__grid" role="list" aria-label="Промпты для пар">
        {CURATED_PROMPT_IDEAS.map((idea) => (
          <article className="prompt-idea" role="listitem" key={idea.id}>
            <div className={`prompt-idea__preview prompt-idea__preview--${idea.visual}`}>
              <img
                className="prompt-idea__image"
                src={idea.previewSrc}
                alt={idea.previewAlt}
                width="480"
                height="480"
                loading="lazy"
                decoding="async"
              />
              <span className="prompt-idea__mark">{idea.emoji}</span>
            </div>
            <div className="prompt-idea__body">
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <Button
                size="m"
                mode="secondary"
                className="prompt-idea__button"
                after={<Icon24ArrowRightOutline />}
                aria-label={`Открыть промпт «${idea.title}»`}
                onClick={() => void openImagePrompt(idea.id, 'results')}
              >
                Открыть
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
