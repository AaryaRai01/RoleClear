import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import './index.css';


async function clearOldServiceWorkers() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registrations =
    await navigator.serviceWorker.getRegistrations();

  await Promise.all(
    registrations.map(
      (registration) =>
        registration.unregister(),
    ),
  );
}


async function clearOldCaches() {
  if (!('caches' in window)) {
    return;
  }

  const cacheNames =
    await caches.keys();

  await Promise.all(
    cacheNames.map(
      (cacheName) =>
        caches.delete(cacheName),
    ),
  );
}


async function startApp() {
  /*
   * DEVELOPMENT:
   *
   * Do not register the PWA service worker while developing.
   * An old cached bundle can otherwise replace the current
   * Vite source code in the browser.
   */
  if (import.meta.env.DEV) {
    await clearOldServiceWorkers();

    await clearOldCaches();
  }

  createRoot(
    document.getElementById('root')!,
  ).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}


void startApp();
