const CACHE_NAME = 'african-odyssey-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/data.js',
];

// Install event: Pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // console.log('[Service Worker] Pre-caching critical assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            // console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Strategy: Network-First for HTML (Navigation)
  // Ensures users always get the latest version of the app shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If offline, return the cached index.html
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Strategy: Stale-While-Revalidate for other assets
  // Returns cached version immediately, but updates it in the background
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Check if valid response
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              (networkResponse.type !== 'basic' &&
                networkResponse.type !== 'cors' &&
                networkResponse.type !== 'opaque')
            ) {
              return networkResponse;
            }
            // Cache the new response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            // Network failure, just return whatever we have (or nothing)
            // If we have no cache and no network, this will fail naturally.
          });

        // Return cached response if available, otherwise wait for network
        return response || fetchPromise;
      });
    })
  );
});
