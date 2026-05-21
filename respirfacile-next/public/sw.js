// Cache the resources static for offline-first
const CACHE_NAME = 'respirfacile-v1';
const urlsToCache = ['/', '/exercises', '/dashboard', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});
