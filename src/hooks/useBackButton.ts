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
    if (!window.history.state?.panel) {
      window.history.replaceState({ panel: defaultPanel }, '');
    }
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
        window.history.pushState({ panel: panelId }, '');
      }
    },
    [defaultPanel]
  );

  useEffect(() => {
    const historyPanel = window.history.state?.panel;
    if (activePanel === defaultPanel && historyPanel && historyPanel !== defaultPanel) {
      isNavigatingRef.current = true;
      window.history.back();
    }
  }, [activePanel, defaultPanel]);

  return { pushPanel };
}
