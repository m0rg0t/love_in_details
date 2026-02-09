import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge';
import App from './App';
import { checkVKBridge } from './utils/platform';

checkVKBridge().then((isVK) => {
  if (isVK) {
    bridge.send('VKWebAppInit');
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
