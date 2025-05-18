import 'leaflet/dist/leaflet.css';
import 'tiny-slider/dist/tiny-slider.css';
import './styles/styles.css';
import './styles/responsives.css';

import App from './scripts/app';
import Camera from './scripts/utils/camera';

let isRendering = false;

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });

  // Skip to main content handler
  if (app.skipLinkButton) {
    app.skipLinkButton.addEventListener('click', (event) => {
      event.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.focus();
    });
  }

  try {
    if (!isRendering) {
      isRendering = true;
      await app.renderPage();
      isRendering = false;
    }
  } catch (error) {
    console.error('Render awal gagal:', error);
    isRendering = false;
  }

  // Re-render saat hash berubah
  window.addEventListener('hashchange', async () => {
    try {
      await app.renderPage();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Transisi dibatalkan:', error);
        return;
      }
      console.error('Render gagal:', error);
    } finally {
      Camera.stopAllStreams(); // Selalu hentikan kamera setelah transisi
    }
  });
});
