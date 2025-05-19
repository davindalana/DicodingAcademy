import 'leaflet/dist/leaflet.css';
import 'tiny-slider/dist/tiny-slider.css';
import './styles/styles.css';
import './styles/responsives.css';

import App from './scripts/app';
import Camera from './scripts/utils/camera';

let isRendering = false;

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('main-content');
  const drawerButton = document.getElementById('drawer-button');
  const drawerNavigation = document.getElementById('navigation-drawer');
  const skipLinkButton = document.getElementById('skip-link');

  const app = new App({
    content,
    drawerButton,
    drawerNavigation,
    skipLinkButton,
  });

  // Skip to content accessibility (tidak perlu cek app.skipLinkButton, cukup pakai yang sudah diambil)
  skipLinkButton?.addEventListener('click', (event) => {
    event.preventDefault();
    content?.focus();
  });

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
      Camera.stopAllStreams(); // Hentikan kamera setiap ganti halaman
    }
  });
});
