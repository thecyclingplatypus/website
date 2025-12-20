const CACHE_NAME = 'platypus-cache-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/video.html',
    '/photo-artists.html',
    '/photo-brand-work.html',
    '/photo-concept-shoots.html',
    '/photo-bts.html',
    '/photo-studio.html',
    '/style.css',
    '/script.js',
    '/assets/logo.png',
    '/assets/platypus.png'
];

// Install event: cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event: caching strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip navigation requests to avoid redirect issues with local dev servers
    if (event.request.mode === 'navigate') {
        return;
    }

    // Strategy: Cache First for Images (especially Cloudinary)
    if (event.request.destination === 'image' || url.hostname.includes('cloudinary.com')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 ||
                        (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                        return networkResponse;
                    }
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    return null;
                });
            })
        );
        return;
    }

    // Strategy: Stale-While-Revalidate for JS/CSS/HTML
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => { });
            return cachedResponse || fetchPromise;
        })
    );
});
