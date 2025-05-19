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

        if (!document.querySelector('.story-detail')) {
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

        await this.#presenter.showStoryDetail(this.#storyId);
        await this._updateButtonState();
        this._setupActionButtons();
    }

    getAccessToken() {
        return localStorage.getItem('token');
    }

    showNotification({ title, body }) {
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { title, body },
        }));
    }

    async displayStoryDetail(story) {
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

        if (story.lat !== undefined && story.lon !== undefined) {
            this._renderMap(story.lat, story.lon);
        } else {
            const mapElement = document.getElementById('story-map');
            if (mapElement) {
                mapElement.innerHTML = '<p>Lokasi tidak tersedia.</p>';
                mapElement.setAttribute('aria-label', 'Lokasi tidak tersedia');
            }
        }

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
                console.error('Error saat destroy map sebelumnya:', err);
            }
        }

        requestAnimationFrame(() => {
            setTimeout(async () => {
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
            }, 100);
        });
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
            console.error('Button elements not found');
            return;
        }

        const isSaved = await this.#savePresenter.isStorySaved(this.#storyId);
        if (isSaved) {
            saveButton.disabled = true;
            saveButton.textContent = 'Tersimpan';
            saveButton.setAttribute('aria-label', 'Story sudah disimpan');
            deleteButton.disabled = false;
        } else {
            saveButton.disabled = false;
            saveButton.textContent = 'Simpan';
            saveButton.setAttribute('aria-label', 'Simpan story untuk akses offline');
            deleteButton.disabled = true;
        }
    }

    _setupActionButtons() {
        const saveBtn = document.getElementById('save-story');
        const deleteBtn = document.getElementById('delete-story');

        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                if (!this.#story) {
                    console.error('No story data available to save');
                    this.showNotification({
                        title: 'Gagal',
                        body: 'Tidak ada data story untuk disimpan',
                    });
                    return;
                }

                try {
                    await this.#savePresenter.saveStory(this.#story);
                    await this._updateButtonState();
                } catch (error) {
                    // Error sudah ditangani oleh SaveStoriesPresenter
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                try {
                    await this.#savePresenter.deleteStory(this.#storyId);
                    await this._updateButtonState();
                } catch (error) {
                    // Error sudah ditangani oleh SaveStoriesPresenter
                }
            });
        }
    }
}