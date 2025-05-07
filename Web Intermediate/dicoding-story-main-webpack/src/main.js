import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "leaflet/dist/leaflet.css";
import "./styles/main.css";

import "./scripts/app.js";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registered: ', reg);

      // Optional: listen for updates manually
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content available, please refresh.');
            } else {
              // Cached for offline
              console.log('App is ready for offline use.');
            }
          }
        };
      };
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
