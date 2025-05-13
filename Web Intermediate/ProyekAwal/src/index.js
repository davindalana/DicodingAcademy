// CSS imports
import './styles/styles.css';
import './styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css'

// Components
import App from './scripts/app';
import Camera from './scripts/utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  const skipLinkButton = document.getElementById('skip-link');
  console.log(skipLinkButton);
  if (app.skipLinkButton) {
    app.skipLinkButton.addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("main-content").focus();
    });
  } else {
    console.error('Elemen skip-link tidak ditemukan!');
  }


  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    try {
      await app.renderPage();
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error(error);
    }
    Camera.stopAllStreams();
  });
});
