/**
 * VICTUS MAINFRAME - SERVICE WORKER V1.0
 * Gerencia o cache para operação offline e instalação PWA.
 */

const CACHE_NAME = "victus-mainframe-v1";

// Lista de arquivos vitais para o funcionamento offline
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon.png"
];

// Instalação: Salva os recursos estáticos no armazenamento de cache do navegador
self.addEventListener("install", (event) => {
    // Força o Service Worker a se tornar o ativo imediatamente
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("VICTUS: CACHE_SISTEMA_OPERACIONAL_GRAVADO");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação: Limpa versões antigas do cache para evitar conflitos de código
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("VICTUS: LIMPANDO_CACHE_OBSOLETO", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // Garante que o SW controle a página imediatamente
    return self.clients.claim();
});

// Interceptação de Busca: Tenta carregar do cache primeiro, se falhar, busca na rede
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retorna o arquivo do cache ou faz a requisição normal
            return response || fetch(event.request).catch(() => {
                // Se ambos falharem (offline e sem cache), você poderia retornar uma página de erro aqui
                console.error("VICTUS: FALHA_AO_RECUPERAR_RECURSO_OFFLINE");
            });
        })
    );
});
