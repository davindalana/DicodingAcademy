import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { BASE_URL } from '../scripts/config';

// Precaching build assets (hasil build dari Webpack)
precacheAndRoute(self.__WB_MANIFEST);

// HTML & SPA Navigation
registerRoute(
  ({ request, url }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-pages',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// JS & CSS
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// API GET requests (story list & detail)
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return url.origin === baseUrl.origin && request.method === 'GET' && request.destination === '';
  },
  new NetworkFirst({
    cacheName: 'story-api-data',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }), // 1 hari
    ],
  })
);

// POST requests (sync offline)
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return url.origin === baseUrl.origin && request.method === 'POST';
  },
  new NetworkFirst({
    cacheName: 'api-post-queue',
    plugins: [
      new BackgroundSyncPlugin('story-sync-queue', {
        maxRetentionTime: 24 * 60, // 24 jam
      }),
    ],
  })
);

// Image caching
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return url.origin === baseUrl.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }), // 7 hari
    ],
  })
);

// Map tiles (maptiler / OSM)
registerRoute(
  ({ url }) => url.origin.includes('maptiler') || url.origin.includes('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// Push notification
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Story App', options: { body: 'Notifikasi baru' } };
  }

  const { title, options } = data;
  event.waitUntil(
    self.registration.showNotification(title, {
      ...options,
      icon: '/icons/icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
