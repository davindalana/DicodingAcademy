const CACHE_NAME = 'story-app-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.bundle.js',
    '/styles/styles.css',
    '/styles/responsives.css',
    '/tiny-slider.css',
    '/leaflet.css',
    '/images/placeholder-image.jpg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/manifest.json'
];

// Install: Cache Application Shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache
                .addAll(urlsToCache)
                .catch((error) => {
                    console.error('Gagal meng-cache beberapa file:', error);
                    // Lanjutkan instalasi meskipun ada error
                    return cache.addAll(urlsToCache.filter(url => !url.includes('manifest.json') && !url.includes('icons/')));
                });
        })
    );
    // self.skipWaiting(); // Opsional, bisa diaktifkan jika mau update langsung
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            )
        )
    );
    // self.clients.claim(); // Opsional, bisa diaktifkan jika mau update langsung
});

// Fetch: Cache First untuk statis, Network with Cache Fallback untuk dinamis
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    const path = requestUrl.pathname;
    const isStaticAsset = urlsToCache.includes(path) || urlsToCache.some(url => path.endsWith(url));

    if (requestUrl.origin === location.origin && isStaticAsset) {
        // Cache-first untuk asset statis
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    } else {
        // Network-first untuk API / request dinamis dengan cache fallback
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                fetch(event.request)
                    .then((response) => {
                        if (response.ok && event.request.method === 'GET') {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    })
                    .catch(() =>
                        caches.match(event.request).then((response) => {
                            if (response) {
                                return response;
                            }
                            return new Response(
                                JSON.stringify({
                                    error: true,
                                    message: 'Anda sedang offline. Konten tidak tersedia.',
                                }),
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'application/json' },
                                }
                            );
                        })
                    )
            )
        );
    }
});

// Push: Tangani notifikasi push
self.addEventListener('push', (event) => {
    let notificationData = {};
    try {
        notificationData = event.data.json();
    } catch (error) {
        // Fallback jika data tidak valid
        notificationData = {
            title: 'Story App',
            options: { body: 'Notifikasi baru diterima' },
        };
    }

    const { title, options } = notificationData;
    event.waitUntil(
        self.registration.showNotification(title, {
            ...options,
            icon: '/icons/icon-192.png',
        })
    );
});

// Notification click: Buka aplikasi
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
