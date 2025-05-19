import { getActiveRoute } from './routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateStoryListErrorTemplate,
} from './templates';
import { setupSkipToContent, transitionHelper } from './utils/index';
import { getAccessToken, getLogout } from './utils/auth';
import { routes } from './routes/routes';
import { registerPushNotifications, unsubscribePushNotifications, setupNotificationListener } from './utils/push-notification';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;
  #isRendering = false;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    if (!this.#content) {
      console.error('Kontainer konten utama (#content) tidak ditemukan di DOM');
    }
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
    this.#setupPushNotificationControls();
    this.#setupNotificationListener();
    this.#setupNavigationList();

    window.addEventListener('hashchange', () => this.renderPage());
    this.renderPage();
  }

  #setupNotificationListener() {
    setupNotificationListener();
  }

  #setupDrawer() {
    console.log('Drawer Button:', this.#drawerButton);
    console.log('Drawer Navigation:', this.#drawerNavigation);
    if (!this.#drawerButton || !this.#drawerNavigation) {
      console.error('Drawer button or navigation not found');
      return;
    }
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#drawerNavigation.classList.toggle('open');
      console.log('Drawer classes:', this.#drawerNavigation.classList);
    });
    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);
      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        console.log('Closing drawer');
        this.#drawerNavigation.classList.remove('open');
      }
    });
    this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        console.log('Link clicked, closing drawer');
        this.#drawerNavigation.classList.remove('open');
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.querySelector('#navlist-main');
    const navList = this.#drawerNavigation.querySelector('#navlist');

    console.log('Is logged in:', isLogin);
    console.log('NavListMain:', navListMain);
    console.log('NavList:', navList);
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      console.log('Unauthenticated nav:', navList.innerHTML);
      return;
    }
    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();
    console.log('Authenticated nav main:', navListMain.innerHTML);
    console.log('Authenticated nav:', navList.innerHTML);

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();
        location.hash = '/login';
      }
    });
  }

  #setupPushNotificationControls() {
    document.addEventListener('click', async (event) => {
      if (event.target.closest('#subscribe-button') || event.target.closest('#story-detail-notify-me')) {
        event.preventDefault();
        const success = await registerPushNotifications();
        if (success) {
          this.#showNotification('Berhasil', 'Anda telah berlangganan notifikasi push.');
        } else {
          this.#showNotification('Gagal', 'Gagal berlangganan notifikasi push.');
        }
      }

      if (event.target.closest('#unsubscribe-button')) {
        event.preventDefault();
        const success = await unsubscribePushNotifications();
        if (success) {
          this.#showNotification('Berhasil', 'Anda telah membatalkan langganan notifikasi push.');
        } else {
          this.#showNotification('Gagal', 'Gagal membatalkan langganan notifikasi push.');
        }
      }
    });
  }

  #showNotification(title, message) {
    const notificationContainer = document.createElement('div');
    notificationContainer.innerHTML = `
      <div class="notification-bar" role="alert">
        <div class="notification-bar__content">
          <h3 class="notification-bar__title">${title}</h3>
          <p class="notification-bar__body">${message}</p>
        </div>
        <button class="notification-bar__close" aria-label="Tutup notifikasi">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    document.body.appendChild(notificationContainer);
    setTimeout(() => notificationContainer.remove(), 5000);
  }

  async renderPage() {
    if (this.#isRendering) return; // Hentikan jika sudah rendering
    this.#isRendering = true;

    const url = getActiveRoute();
    const route = routes[url] || routes['#/'];


    if (!route || typeof route !== 'function') {
      console.error(`Rute untuk "${url}" tidak valid atau bukan fungsi.`);
      this.#content.innerHTML = generateStoryListErrorTemplate('Rute tidak valid.');
      return;
    }
    try {
      const page = route();
      console.log('Memulai render untuk rute:', url);

      const transition = transitionHelper({
        updateDOM: async () => {
          if (!this.#content) {
            console.error('Kontainer konten utama (#content) tidak ditemukan');
            return;
          }
          try {
            console.log('Merender halaman...');
            const renderedContent = await page.render();
            this.#content.innerHTML = renderedContent;
            console.log('DOM diperbarui untuk rute:', url);
            if (page.afterRender) {
              console.log('Menjalankan afterRender...');
              await page.afterRender();
              console.log('afterRender selesai');
            }
          } catch (error) {
            console.error('Error saat merender halaman:', error);
            this.#content.innerHTML = generateStoryListErrorTemplate(
              navigator.onLine
                ? 'Gagal memuat konten. Coba lagi nanti.'
                : 'Anda sedang offline. Konten tidak tersedia.'
            );
          }
        },
      });


      if (!page) {
        console.error('Halaman tidak ditemukan untuk URL:', url);
        this.#content.innerHTML = generateStoryListErrorTemplate('Halaman tidak ditemukan.');
        this.#isRendering = false;
        return;
      }
      // console.log('Rute aktif:', url);

      transition.ready.catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Transisi dibatalkan karena navigasi baru:', error.message);
          return; // Abaikan AbortError
        }
        console.error('Error transisi:', error);
        this.#showNotification('Error', 'Gagal memuat halaman');
      });

      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        this.#setupNavigationList();
        this.#isRendering = false;
      });
    } catch (error) {
      console.error('Error saat memuat halaman:', error);
      this.#content.innerHTML = generateStoryListErrorTemplate('Gagal memuat halaman.');
      this.#isRendering = false;
    }
  }
}