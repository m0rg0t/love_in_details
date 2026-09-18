import { useEffect, useRef, useCallback } from 'react';
import type { PanelId } from '../types';

interface UseBackButtonOptions {
  activePanel: PanelId;
  defaultPanel: PanelId;
  setActivePanel: (panel: PanelId) => void;
}

export function useBackButton({
  activePanel,
  defaultPanel,
  setActivePanel,
}: UseBackButtonOptions) {
  const isNavigatingRef = useRef(false);
  const activePanelRef = useRef(activePanel);

  useEffect(() => {
    activePanelRef.current = activePanel;
  }, [activePanel]);

  useEffect(() => {
    // A document reload recreates React state from the welcome panel while the
    // browser may still carry a deeper in-app entry. Normalize that stale entry
    // so the return-to-welcome effect never navigates outside the Mini App.
    window.history.replaceState({ panel: defaultPanel, appDepth: 0 }, '');
  }, [defaultPanel]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }
      const targetPanel = (event.state?.panel || defaultPanel) as PanelId;
      if (activePanelRef.current !== targetPanel) {
        setActivePanel(targetPanel);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultPanel, setActivePanel]);

  const pushPanel = useCallback(
    (panelId: PanelId) => {
      if (panelId !== defaultPanel) {
        const currentDepth = Number(window.history.state?.appDepth) || 0;
        window.history.pushState({ panel: panelId, appDepth: currentDepth + 1 }, '');
      }
    },
    [defaultPanel]
  );

  useEffect(() => {
    const historyPanel = window.history.state?.panel;
    if (activePanel === defaultPanel && historyPanel && historyPanel !== defaultPanel) {
      const appDepth = Math.max(1, Number(window.history.state?.appDepth) || 1);
      isNavigatingRef.current = true;
      window.history.go(-appDepth);
    }
  }, [activePanel, defaultPanel]);

  return { pushPanel };
}
