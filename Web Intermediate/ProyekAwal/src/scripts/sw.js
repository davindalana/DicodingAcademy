
const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.bundle.js',
    '/styles.css',
    '/images/placeholder-image.jpg',
];

// Install event: Cache static assets for offline support
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate event: Clean up old caches
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
    self.clients.claim();
});

// Fetch event: Serve cached assets for offline support
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});

// Push event: Handle incoming push notifications
self.addEventListener('push', (event) => {
    let notificationData = {};

    try {
        notificationData = event.data.json();
    } catch (error) {
        // Fallback if no JSON payload
        notificationData = {
            title: 'Story App',
            options: { body: 'New notification received' },
        };
    }

    // Ensure notification matches the provided schema
    const { title, options } = notificationData;

    event.waitUntil(
        self.registration.showNotification(title, {
            ...options,
            icon: '../', // Ensure an icon exists in src/public/icon.png
        })
    );
});

// Notification click event: Open the app or specific story
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Open the app's home page; adjust to story URL if needed
    );
});