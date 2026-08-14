// Service Worker — Campanha Realista
// Estratégia: precache do app shell + Bootstrap CDN, cache-first com fallback de rede.

const CACHE_VERSION = 'campanha-realista-v6';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './cities_ats.json',
  './cities_ets2.json',
  './companies_ats.json',
  './companies_ets2.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname === 'cdn.jsdelivr.net';

  if (!isSameOrigin && !isCDN) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') {
          if (resp && resp.type === 'opaque') return resp;
          return resp;
        }
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return resp;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
