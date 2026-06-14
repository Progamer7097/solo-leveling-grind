const CACHE_NAME = 'sololeveling-fitness-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker and cache essential static game engine assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('System Caching Core Gameplay Assets...');
      return cache.addAll(ASSETS).catch(err => console.log('Asset caching error:', err));
    }).then(() => self.skipWaiting())
  );
});

// Activate & remove old legacy version caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Clearing Outdated Core Cache Matrix:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache interceptor - Network First strategy fallback to Local Cache if offline
self.addEventListener('fetch', (e) => {
  // Only handle internal requests and secure external stylesheets
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then((response) => {
      // Dynamic network cache update
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Offline fallback
      return caches.match(e.request);
    })
  );
});
