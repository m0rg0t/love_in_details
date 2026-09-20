import React from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon24BookmarkCheckOutline, Icon24BookmarkOutline } from '@vkontakte/icons';
import { useAddToFavorites } from '../hooks/useAddToFavorites';

export const FavoriteReturnCard: React.FC = () => {
  const {
    isChecking,
    isAvailable,
    isAdding,
    isAdded,
    addToFavorites,
  } = useAddToFavorites();

  if (isChecking || !isAvailable) return null;

  return (
    <section className={`favorite-return${isAdded ? ' favorite-return--added' : ''}`}>
      <div className="favorite-return__icon" aria-hidden="true">
        {isAdded ? <Icon24BookmarkCheckOutline /> : <Icon24BookmarkOutline />}
      </div>
      <div className="favorite-return__copy">
        <h2>{isAdded ? 'Приложение в избранном' : 'Не потеряйте следующий разговор'}</h2>
        <p>
          {isAdded
            ? 'Теперь «Любовь в деталях» будет проще найти во ВКонтакте.'
            : 'Добавьте приложение в избранное VK — без подписки и автоматических уведомлений.'}
        </p>
      </div>
      <Button
        size="m"
        mode="secondary"
        loading={isAdding}
        disabled={isAdding || isAdded}
        onClick={() => void addToFavorites()}
      >
        {isAdded ? 'Добавлено' : 'Добавить в избранное'}
      </Button>
    </section>
  );
};
