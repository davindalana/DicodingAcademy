import HomePage from "../views/pages/home-page.js";
import storyRepository from "../data/story-repository.js";
import authRepository from "../data/auth-repository.js";
import { applyCustomAnimation } from "../utils/view-transition.js";
import Swal from "sweetalert2";

class HomePresenter {
  constructor(params = {}) {
    this._params = params;
    this._view = null;
    this._container = document.querySelector("#pageContent");

    if (!this._container) {
      console.error("Container #pageContent not found.");
      return;
    }

    this._isLoading = false;
    this._error = null;
    this._stories = [];

    this._fetchStories = this._fetchStories.bind(this);
    this._handleRetry = this._handleRetry.bind(this);
  }

  /**
   * Inisialisasi presenter dan memulai transisi tampilan
   */
  async init() {
    this._renderLoading();

    applyCustomAnimation("#pageContent", {
      name: "home-transition",
      duration: 400,
    });

    await this._fetchStories();
  }

  /**
   * Mengambil data cerita dari repository
   */
  async _fetchStories() {
    try {
      this._setLoadingState(true);

      const isAuthenticated = authRepository.isAuthenticated();

      if (!isAuthenticated) {
        this._stories = [];
        this._setLoadingState(false);
        this._renderView();

        this._showLoginPrompt();
        return;
      }

      const response = await storyRepository.getStories({ location: 1 });
      this._stories = response?.listStory ?? [];
      this._setLoadingState(false);
      this._renderView();
    } catch (error) {
      console.error("Failed to fetch stories:", error);

      this._setLoadingState(false);
      this._error = error.message || "Failed to load stories. Please try again.";
      this._renderError();
    }
  }

  /**
   * Menampilkan prompt login menggunakan SweetAlert
   */
  _showLoginPrompt() {
    Swal.fire({
      title: "Welcome to Dicoding Story!",
      text: "Log in to see and share stories from the Dicoding community.",
      icon: "info",
      confirmButtonColor: "#547792",
      confirmButtonText: "Log In",
      showCancelButton: true,
      cancelButtonText: "Maybe Later",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.hash = "#/login";
      }
    });
  }

  /**
   * Mengatur dan merender tampilan loading
   */
  _renderLoading() {
    this._createView({ isLoading: true });
  }

  /**
   * Mengatur dan merender tampilan error
   */
  _renderError() {
    this._createView({ error: this._error });
    this._view.setRetryHandler(this._handleRetry);
  }

  /**
   * Merender tampilan utama setelah data dimuat
   */
  _renderView() {
    this._createView();

    if (this._error) {
      this._view.setRetryHandler(this._handleRetry);
    }
  }

  /**
   * Abstraksi pembuatan view agar tidak duplikatif
   */
  _createView({ isLoading = false, stories = this._stories, error = null } = {}) {
    this._view = new HomePage({
      isLoading,
      stories,
      error,
      container: this._container,
    });

    this._view.render();
  }

  /**
   * Handler ketika tombol "Coba Lagi" ditekan
   */
  _handleRetry() {
    this._fetchStories();
  }

  /**
   * Membersihkan tampilan saat berpindah halaman
   */
  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }

  /**
   * Setter untuk status loading
   */
  _setLoadingState(state) {
    this._isLoading = state;
    this._error = null;
  }
}

export default HomePresenter;