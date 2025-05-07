const CACHE_NAME = "dicoding-story-v1";

// Gunakan path absolut untuk file lokal (bukan relatif seperti './')
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/index.css",
  "/assets/index.js",
  "/favicon.png",
  "/leaflet/marker-icon.png",   // <-- diperbaiki
  "/leaflet/marker-shadow.png", // <-- diperbaiki
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",

];

// Install event: caching initial resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Cache opened");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`[Service Worker] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Fetch event: serve cached content if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fallback to network and cache the result
      return fetch(event.request)
        .then((networkResponse) => {
          // Hanya cache response yang valid
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone response karena satu stream hanya bisa dibaca sekali
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((err) => {
          console.warn(`[Service Worker] Fetch failed: ${err}`);
          throw err;
        });
    })
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: "New Notification",
      options: {
        body: event.data ? event.data.text() : "No content",
        icon: "/favicon.ico",
      },
    };
  }

  const title = notificationData.title || "Dicoding Story";
  const options = notificationData.options || {};

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = "/#/"; // Redirect ke halaman utama

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});