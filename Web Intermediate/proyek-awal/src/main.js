import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "leaflet/dist/leaflet.css";
import "./styles/main.css";

import "./scripts/app.js";

// PWA Support with Workbox
if (process.env.NODE_ENV === "production" && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}
document.getElementById('app').innerHTML = `
  <h1>Welcome to Dicoding Story App</h1>
`;