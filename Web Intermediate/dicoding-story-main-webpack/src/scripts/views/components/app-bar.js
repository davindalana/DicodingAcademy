import authRepository from "../../data/auth-repository.js";

class AppBar extends HTMLElement {
  constructor() {
    super();

    this._isAuthenticated = authRepository.isAuthenticated();
    this._handleAuthChange = this._handleAuthChange.bind(this);
    this._handleLogout = this._handleLogout.bind(this);
    this._handleMenuToggle = this._handleMenuToggle.bind(this);
  }

  connectedCallback() {
    this.render();

    window.addEventListener("user-logged-in", this._handleAuthChange);
    window.addEventListener("user-logged-out", this._handleAuthChange);
  }

  disconnectedCallback() {
    window.removeEventListener("user-logged-in", this._handleAuthChange);
    window.removeEventListener("user-logged-out", this._handleAuthChange);
  }

  render() {
    const user = authRepository.getUserData() || {};
    const isAuth = this._isAuthenticated;

    this.innerHTML = `
      <nav class="app-nav">
  <div class="app-nav__container">
    <a href="#/" class="app-nav__brand">Dicoding Story</a>

    <button data-toggle-menu class="app-nav__toggle" aria-label="Toggle menu">
      <i class="fas fa-bars"></i>
    </button>

    <ul class="app-nav__list ${isAuth ? "" : "guest"}">
      <li><a href="#/" class="app-nav__link"><i class="fas fa-home"></i><span>Home</span></a></li>
      ${isAuth
        ? `
        <li><a href="#/add" class="app-nav__link"><i class="fas fa-plus-circle"></i><span>Add Story</span></a></li>
        <li class="app-nav__user"><i class="fas fa-user-circle"></i><span>${user.name || "User"}</span></li>
        <li><button data-logout class="app-nav__button"><i class="fas fa-sign-out-alt"></i><span>Logout</span></button></li>
      `
        : `
        <li><a href="#/login" class="app-nav__link"><i class="fas fa-sign-in-alt"></i><span>Login</span></a></li>
        <li><a href="#/register" class="app-nav__link"><i class="fas fa-user-plus"></i><span>Register</span></a></li>
      `
      }
    </ul>
  </div>
</nav>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const logoutButton = this.querySelector("[data-logout]");
    if (logoutButton) {
      logoutButton.addEventListener("click", this._handleLogout);
    }

    const toggleButton = this.querySelector("[data-toggle-menu]");
    if (toggleButton) {
      toggleButton.addEventListener("click", this._handleMenuToggle);
    }
  }

  _handleAuthChange() {
    this._isAuthenticated = authRepository.isAuthenticated();
    this.render();
  }

  _handleLogout(event) {
    event.preventDefault();
    authRepository.logout();
    window.location.hash = "#/";
    window.dispatchEvent(new Event("user-logged-out"));
  }

  _handleMenuToggle() {
    const navList = this.querySelector(".app-nav__list");
    if (navList) navList.classList.toggle("app-nav__list--open");
  }
}

customElements.define("app-bar", AppBar);

export default AppBar;