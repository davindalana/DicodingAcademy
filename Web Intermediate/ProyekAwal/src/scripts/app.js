import { getActiveRoute } from './routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
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

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    if (!this.#content) {
      console.error('Main content container (#content) not found in DOM');
    }
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
    this.#setupPushNotificationControls();
    this.#setupNotificationListener();
    setupNotificationListener();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

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
        await registerPushNotifications();
      }

      if (event.target.closest('#unsubscribe-button')) {
        event.preventDefault();
        await unsubscribePushNotifications();
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || routes['#/'];

    if (!route || typeof route !== 'function') {
      console.error(`Route for "${url}" is invalid or not a function.`);
      return;
    }

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        if (!this.#content) {
          console.error('Main content container (#content) not found');
          return;
        }
        const renderedContent = await page.render();
        this.#content.innerHTML = renderedContent;
        console.log('DOM updated for route:', url);
        await page.afterRender?.();
      },
    });

    console.log('Routing ke:', url, 'dengan page:', page);

    if (!page) {
      console.error('Page tidak ditemukan untuk URL:', url);
      return;
    }
    console.log('Active route:', url);

    transition.ready.catch((error) => {
      console.error('Transition error:', error);
      this.#showNotification('Error', 'Failed to load page');
    });
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();
    });
  }
}
