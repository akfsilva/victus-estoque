/**
 * VICTUS MAINFRAME - SERVICE WORKER (WORKBOX EDITION)
 * Baseado nas recomendações do PWABuilder para máxima compatibilidade com APK.
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "victus-offline-v1";

// Força o Service Worker a se atualizar assim que houver mudança no código
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// ESTRATÉGIA: StaleWhileRevalidate
// Ele carrega o que está no cache instantaneamente (pro app abrir rápido)
// e busca atualizações em segundo plano.
workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Tenta usar o preload (acelera o carregamento se houver rede)
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // Se a rede falhar (estiver offline), ele entrega o index.html do cache
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match('index.html');
        return cachedResp;
      }
    })());
  }
});
