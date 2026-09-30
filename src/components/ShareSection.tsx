import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@vkontakte/vkui';
import { Icon24ShareOutline, Icon28StoryOutline } from '@vkontakte/icons';
import type { ComparisonStats } from '../types';
import { generateStoryImage } from '../utils/storyCanvas';
import { trackShare } from '../utils/analytics';
import { getResultPresentation } from '../utils/resultPresentation';
import { WEEKLY_THEME_IMAGE } from '../utils/weeklyTheme';
import { vkBridgeService } from '../services/vkBridge';
import { getAppLink } from '../utils/platform';
import { classifyShareResponse } from '../utils/platformPolicy';
import { isUserCancelError } from '../utils/vkBridgeErrors';
import { BridgeTimeoutError } from '../utils/timeout';

interface ShareSectionProps {
  stats: ComparisonStats;
}

export const ShareSection: React.FC<ShareSectionProps> = ({ stats }) => {
  const [storyAvailable, setStoryAvailable] = useState(false);
  const nativeShareAvailable = useRef(false);
  const [pendingShare, setPendingShare] = useState<'story' | 'link' | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [manualShare, setManualShare] = useState(false);
  const [dialogTimedOut, setDialogTimedOut] = useState(false);
  const pendingRef = useRef(false);
  const presentation = getResultPresentation(stats);
  const appLink = getAppLink();
  const shareText = `Наш ритм вдвоём: ${presentation.title}. Пройдите квиз «Любовь в деталях» — детали останутся между вами.`;
  const manualText = `${shareText}\n${appLink ?? ''}`;

  useEffect(() => {
    let mounted = true;
    void vkBridgeService.supportsStories().then((supported) => { if (mounted) setStoryAvailable(supported); });
    void vkBridgeService.supports('VKWebAppShare').then((supported) => { if (mounted) nativeShareAvailable.current = supported; });
    return () => { mounted = false; };
  }, []);

  const handleFailure = useCallback((error: unknown, kind: 'story' | 'link') => {
    trackShare(kind, false);
    if (isUserCancelError(error) || (error instanceof DOMException && error.name === 'AbortError')) return;
    if (error instanceof BridgeTimeoutError) {
      setDialogTimedOut(true);
      setStatus('Редактор пока не ответил. Проверьте открытое окно; ссылку можно скопировать ниже.');
    } else {
      setStatus('Не получилось открыть отправку. Скопируйте приглашение ниже — ответы останутся между вами.');
    }
    setManualShare(true);
  }, []);

  const handleShareStory = useCallback(async () => {
    if (pendingRef.current || dialogTimedOut || !storyAvailable) return;
    pendingRef.current = true;
    setPendingShare('story');
    setStatus(null);
    try {
      const blob = await generateStoryImage(stats);
      const result = await vkBridgeService.showStory(blob, appLink);
      const success = result.result === true;
      trackShare('story', success);
      setStatus(success ? 'Редактор истории открыт — добавьте свой штрих и публикуйте.' : null);
    } catch (error) {
      handleFailure(error, 'story');
    } finally {
      pendingRef.current = false;
      setPendingShare(null);
    }
  }, [appLink, dialogTimedOut, handleFailure, stats, storyAvailable]);

  const handleShareLink = useCallback(async () => {
    if (pendingRef.current || dialogTimedOut || !appLink) return;
    pendingRef.current = true;
    setPendingShare('link');
    setStatus(null);
    try {
      if (nativeShareAvailable.current) {
        const outcome = classifyShareResponse(await vkBridgeService.shareApp(appLink));
        if (outcome === 'failed') throw new Error('Share failed');
        trackShare('link', outcome === 'success');
        setStatus(outcome === 'success' ? 'Отправка ссылки завершена.' : null);
      } else if (navigator.share) {
        await navigator.share({ title: 'Любовь в деталях', text: shareText, url: appLink });
        trackShare('link', true);
      } else {
        setManualShare(true);
      }
    } catch (error) {
      handleFailure(error, 'link');
    } finally {
      pendingRef.current = false;
      setPendingShare(null);
    }
  }, [appLink, dialogTimedOut, handleFailure, shareText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(manualText);
      setStatus('Приглашение скопировано.');
      trackShare('link', true);
    } catch {
      setStatus('Выделите приглашение ниже и скопируйте его вручную.');
    }
  }, [manualText]);

  return (
    <section className="share-section" aria-labelledby="share-section-title">
      <div
        className="share-card-preview"
        role="img"
        aria-label={`Карточка результата: ${presentation.title}`}
      >
        <img src={WEEKLY_THEME_IMAGE} alt="" aria-hidden="true" loading="eager" decoding="async" />
        <div className="share-card-preview__shade" />
        <span className="share-card-preview__brand">Любовь в деталях</span>
        <div className="share-card-preview__copy">
          <span>Наш ритм вдвоём</span>
          <strong>{presentation.title}</strong>
          <small>А какой ритм у вас?</small>
        </div>
      </div>

      <div className="share-section__content">
        <div className="share-section__copy">
          <span className="results-section__eyebrow">Поделитесь настроением</span>
          <h2 id="share-section-title" className="share-section__title">Карточка без личных ответов</h2>
          <p>Только настроение вашей пары и приглашение пройти квиз — детали останутся между вами.</p>
        </div>

        {(storyAvailable || appLink) ? (
          <div className="share-section__buttons">
            {storyAvailable && <Button
              size="l"
              className="gradient-button share-section__story-button"
              before={<Icon28StoryOutline />}
              loading={pendingShare === 'story'}
              disabled={pendingShare !== null || dialogTimedOut}
              onClick={() => void handleShareStory()}
            >
              В историю
            </Button>}
            {appLink && <Button
              size="l"
              mode="secondary"
              before={<Icon24ShareOutline />}
              loading={pendingShare === 'link'}
              disabled={pendingShare !== null || dialogTimedOut}
              onClick={() => void handleShareLink()}
            >
              Отправить ссылку
            </Button>}
          </div>
        ) : (
          <p className="share-section__note">
            Ссылка для приглашения в Одноклассниках появится после настройки адреса приложения.
          </p>
        )}

        {manualShare && appLink && (
          <div className="share-section__manual">
            <label htmlFor="share-invitation">Приглашение без личных ответов</label>
            <textarea id="share-invitation" readOnly value={manualText} rows={5} onFocus={(event) => event.currentTarget.select()} />
            <Button size="m" mode="secondary" onClick={() => void handleCopy()}>Копировать приглашение</Button>
          </div>
        )}

        {status && <p className="share-section__status" role="status">{status}</p>}
      </div>
    </section>
  );
};
