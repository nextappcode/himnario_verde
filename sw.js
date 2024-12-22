const CACHE_NAME = 'himnario-verde-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './lyrics.css',
  './script.js',
  './sw-register.js',
  './img/logo.png',
  './manifest.json',
  './letras.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(error => console.error('Error en la instalación del cache:', error))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                try {
                  if (event.request.url && !event.request.url.startsWith('chrome-extension://')) {
                    cache.put(event.request, responseToCache);
                  }
                } catch (error) {
                  console.error('Error al cachear el recurso:', error);
                }
              });

            return response;
          })
          .catch(error => {
            console.error('Error en fetch:', error);
            return new Response('Error de red', { status: 500 });
          });
      })
  );
});
