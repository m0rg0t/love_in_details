import React, { useEffect } from 'react';
import { useVKInsets } from '../hooks/useVKInsets';

interface VKInsetsProviderProps {
  children: React.ReactNode;
}

export const VKInsetsProvider: React.FC<VKInsetsProviderProps> = ({ children }) => {
  const insets = useVKInsets();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--vk-inset-top', `${insets.top}px`);
    root.style.setProperty('--vk-inset-bottom', `${insets.bottom}px`);
    root.style.setProperty('--vk-inset-left', `${insets.left}px`);
    root.style.setProperty('--vk-inset-right', `${insets.right}px`);
  }, [insets]);

  return <>{children}</>;
};
