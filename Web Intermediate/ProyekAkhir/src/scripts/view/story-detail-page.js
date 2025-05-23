import * as UrlParser from '../routes/url-parser';
import * as DicodingAPI from '../data/api';
import { generateLoaderAbsoluteTemplate, generateStoryDetailErrorTemplate } from '../templates';
import Map from '../utils/map';
import DetailStoryPresenter from '../presenter/story-detail-presenter';
import SaveStoriesPresenter from '../presenter/saved-stories-presenter';

export default class StoryDetailPage {
    #presenter;
    #savePresenter;
    #map = null;
    #storyId = null;
    #story = null;

    async render() {
        return `
      <section class="story-detail container" role="main" aria-label="Detail Story">
        <div class="story-detail__photo-container">
          <img id="story-photo" class="story-detail__photo" alt="Foto Story" src="" />
        </div>
        <div class="story-detail__info">
          <h2 id="story-name" class="story-detail__name"></h2>
          <p id="story-date" class="story-detail__date"></p>
          <p id="story-description" class="story-detail__description"></p>
        </div>
        <div class="story-detail__map-container">
          <div id="map-loading-container" class="map-loading-container"></div>
          <div id="story-map" class="story-detail__map" role="figure" aria-label="Peta lokasi story"></div>
        </div>
        <div class="story-detail__actions">
          <button id="save-story" class="btn btn-transparent" aria-label="Simpan story untuk akses offline">
            <i class="fas fa-bookmark" aria-hidden="true"></i> Simpan
          </button>
          <button id="delete-story" class="btn btn-transparent" aria-label="Hapus story dari penyimpanan offline">
            <i class="fas fa-trash" aria-hidden="true"></i> Hapus
          </button>
        </div>
        <div class="back-button">
          <a class="btn story-item__read-more" href="#/" aria-label="Kembali ke daftar story">Back</a>
        </div>
        <div id="notification" class="notification" style="display: none;"></div>
      </section>
    `;
    }

    async afterRender() {
        const url = UrlParser.parseActivePathname();
        this.#storyId = url.id;

        if (!this.#storyId) {
            this.displayStoryError('ID story tidak ditemukan');
            return;
        }

        const storyDetailContainer = document.querySelector('.story-detail');
        if (!storyDetailContainer) {
            console.error('Error: .story-detail container not found in DOM');
            this.displayStoryError('Failed to render story detail page');
            return;
        }

        this.#presenter = new DetailStoryPresenter({
            view: this,
            model: DicodingAPI,
        });

        this.#savePresenter = new SaveStoriesPresenter({
            view: this,
        });

        // Ensure buttons are rendered before updating state
        await this.#presenter.showStoryDetail(this.#storyId);
        await this._updateButtonState();
        this._setupActionButtons();
    }

    getAccessToken() {
        return localStorage.getItem('token') || '';
    }

    showNotification({ title, body }) {
        const notification = document.querySelector('#notification');
        if (notification) {
            notification.textContent = body || title;
            notification.style.display = 'block';
            setTimeout(() => (notification.style.display = 'none'), 3000);
        } else {
            console.warn('Notification element not found');
            window.dispatchEvent(new CustomEvent('show-notification', {
                detail: { title, body },
            }));
        }
    }

    async displayStoryDetail(story, { isFromCache } = {}) {
        const photo = document.getElementById('story-photo');
        const name = document.getElementById('story-name');
        const date = document.getElementById('story-date');
        const description = document.getElementById('story-description');

        if (!photo || !name || !date || !description) {
            console.error('One or more story detail elements not found');
            this.displayStoryError('Failed to display story details');
            return;
        }

        this.#story = story;

        photo.src = story.photoUrl || 'images/placeholder-image.jpg';
        photo.alt = `Foto oleh ${story.name || 'Anonim'}`;
        name.textContent = story.name || 'Nama tidak tersedia';
        date.textContent = story.createdAt
            ? new Date(story.createdAt).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
            : 'Tanggal tidak tersedia';
        description.textContent = story.description || 'Deskripsi tidak tersedia';

        if (isFromCache) {
            this.showNotification({ title: 'Offline', body: 'Loaded from offline cache' });
        }

        if (story.lat !== undefined && story.lon !== undefined) {
            this._renderMap(story.lat, story.lon);
        } else {
            const mapElement = document.getElementById('story-map');
            if (mapElement) {
                mapElement.innerHTML = '<p>Lokasi tidak tersedia.</p>';
                mapElement.setAttribute('aria-label', 'Lokasi tidak tersedia');
            }
        }

        // Update button state after rendering story
        await this._updateButtonState();
    }

    displayStoryError(message) {
        const storyDetailContainer = document.querySelector('.story-detail');
        if (!storyDetailContainer) {
            console.error('Error: .story-detail container not found in DOM');
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = generateStoryDetailErrorTemplate(message);
            } else {
                console.error('Fallback failed: #main-content not found');
                this.showNotification({
                    title: 'Error',
                    body: message || 'Failed to display story details',
                });
            }
            return;
        }
        storyDetailContainer.innerHTML = generateStoryDetailErrorTemplate(message);
    }

    async _renderMap(lat, lon) {
        const mapContainer = document.getElementById('story-map');
        if (!mapContainer) {
            console.error('Map container (#story-map) not found');
            return;
        }

        this.showMapLoading();

        if (this.#map && typeof this.#map.destroy === 'function') {
            try {
                this.#map.destroy();
                this.#map = null;
            } catch (err) {
                console.error('Error destroying previous map:', err);
            }
        }

        try {
            this.#map = await Map.build('#story-map', {
                zoom: 13,
                center: [lat, lon],
            });
            this.#map.addMarker([lat, lon], { alt: 'Lokasi Story' }, { content: 'Lokasi Story' });
        } catch (error) {
            console.error('Error rendering map:', error);
            mapContainer.innerHTML = '<p>Gagal memuat peta.</p>';
            mapContainer.setAttribute('aria-label', 'Gagal memuat peta');
        } finally {
            this.hideMapLoading();
        }
    }

    showMapLoading() {
        const mapLoadingContainer = document.getElementById('map-loading-container');
        if (mapLoadingContainer) {
            mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
        }
    }

    hideMapLoading() {
        const mapLoadingContainer = document.getElementById('map-loading-container');
        if (mapLoadingContainer) {
            mapLoadingContainer.innerHTML = '';
        }
    }

    async _updateButtonState() {
        const saveButton = document.getElementById('save-story');
        const deleteButton = document.getElementById('delete-story');

        if (!saveButton || !deleteButton) {
            console.warn('Button elements not found; DOM may not be fully rendered');
            return;
        }

        try {
            const isSaved = await this.#savePresenter.isStorySaved(this.#storyId);
            saveButton.disabled = isSaved;
            saveButton.textContent = isSaved ? 'Tersimpan' : 'Simpan';
            saveButton.setAttribute('aria-label', isSaved ? 'Story sudah disimpan' : 'Simpan story untuk akses offline');
            deleteButton.disabled = !isSaved;
        } catch (error) {
            console.error('Error updating button state:', error);
            this.showNotification({
                title: 'Error',
                body: 'Failed to update save/delete button state',
            });
        }
    }

    _setupActionButtons() {
        const saveBtn = document.getElementById('save-story');
        const deleteBtn = document.getElementById('delete-story');

        if (!saveBtn || !deleteBtn) {
            console.warn('Action buttons not found; DOM may not be fully rendered');
            return;
        }

        saveBtn.addEventListener('click', async () => {
            if (!this.#story) {
                this.showNotification({
                    title: 'Gagal',
                    body: 'Tidak ada data story untuk disimpan',
                });
                return;
            }
            try {
                await this.#savePresenter.saveStory(this.#story);
                await this._updateButtonState();
                this.showNotification({
                    title: 'Berhasil',
                    body: 'Story disimpan untuk akses offline',
                });
            } catch (error) {
                this.showNotification({
                    title: 'Gagal',
                    body: 'Gagal menyimpan story',
                });
            }
        });

        deleteBtn.addEventListener('click', async () => {
            try {
                await this.#savePresenter.deleteStory(this.#storyId);
                await this._updateButtonState();
                this.showNotification({
                    title: 'Berhasil',
                    body: 'Story dihapus dari penyimpanan offline',
                });
            } catch (error) {
                this.showNotification({
                    title: 'Gagal',
                    body: 'Gagal menghapus story',
                });
            }
        });
    }
}