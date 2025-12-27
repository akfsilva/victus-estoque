/**
 * VICTUS MAINFRAME - SERVICE WORKER FINAL
 * Otimizado para funcionamento offline total e conversão para APK.
 */

const CACHE_NAME = "victus-mainframe-v1.0.0";

// Lista de ativos para cache inicial
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon.png"
];

// Instalação: Grava os arquivos no cache
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Força a ativação do novo SW sem esperar abas fecharem
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("VICTUS: SISTEMA DE ARQUIVOS EM CACHE");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação: Limpa versões antigas do cache para não travar o app
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("VICTUS: REMOVENDO CACHE OBSOLETO:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Assume o controle da página imediatamente
});

// Estratégia: Cache First, Network Fallback
// Prioriza o carregamento offline instantâneo
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retorna o recurso do cache se existir, senão busca na rede
            return response || fetch(event.request).then((networkResponse) => {
                // Opcional: Você poderia adicionar novos recursos ao cache aqui
                return networkResponse;
            });
        }).catch(() => {
            // Caso ocorra erro total (offline e sem cache), garante que o app não quebre
            console.error("VICTUS: RECURSO NÃO ENCONTRADO EM MODO OFFLINE");
        })
    );
});
