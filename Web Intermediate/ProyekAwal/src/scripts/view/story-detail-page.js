// src/scripts/view/story-detail-page.js
import * as UrlParser from '../routes/url-parser';
import * as DicodingAPI from '../data/api';
import { generateLoaderAbsoluteTemplate, generatestoryDetailErrorTemplate } from '../templates';
import Map from '../utils/map';
import DetailStoryPresenter from '../presenter/story-detail-presenter';

export default class StoryDetailPage {
    #presenter;
    #map;

    async render() {
        return `
      <section class="story-detail container">
        <div class="story-detail__photo-container">
          <img id="story-photo" class="story-detail__photo" alt="Foto Story" />
        </div>
        <div class="story-detail__info">
          <h2 id="story-name" class="story-detail__name"></h2>
          <p id="story-date" class="story-detail__date"></p>
          <p id="story-description" class="story-detail__description"></p>
        </div>
        <div class="story-detail__map-container">
          <div id="map-loading-container" class="map-loading-container"></div>
          <div id="story-map" class="story-detail__map"></div>
        </div>
        <div class="back-button">
          <a class="btn story-item__read-more" href="#/">Back</a>
        </div>
      </section>
    `;
    }

    async afterRender() {
        console.log('afterRender: Checking .story-detail');
        console.log('story-detail exists:', !!document.querySelector('.story-detail'));

        this.#presenter = new DetailStoryPresenter({
            view: this,
            model: DicodingAPI,
        });

        const url = UrlParser.parseActivePathname();
        const storyId = url.id;
        console.log('StoryId:', storyId);
        console.log('url:', url);

        await this.#presenter.showStoryDetail(storyId);
    }

    getAccessToken() {
        return localStorage.getItem('token');
    }

    displayStoryDetail(story) {
        const photo = document.getElementById('story-photo');
        const name = document.getElementById('story-name');
        const date = document.getElementById('story-date');
        const description = document.getElementById('story-description');

        if (!photo || !name || !date || !description) {
            console.error('One or more story detail elements not found');
            this.displayStoryError('Failed to display story details');
            return;
        }

        photo.src = story.photoUrl;
        photo.alt = `Foto oleh ${story.name}`;
        name.textContent = story.name;
        date.textContent = new Date(story.createdAt).toLocaleString();
        description.textContent = story.description;

        if (story.lat !== undefined && story.lon !== undefined) {
            this._renderMap(story.lat, story.lon);
        } else {
            document.getElementById('story-map').textContent = 'Lokasi tidak tersedia.';
        }
    }

    displayStoryError(message) {
        const storyDetailContainer = document.querySelector('.story-detail');
        if (!storyDetailContainer) {
            console.error('Error: .story-detail container not found in DOM');
            // Fallback to #content
            const mainContent = document.querySelector('#content');
            if (mainContent) {
                mainContent.innerHTML = generatestoryDetailErrorTemplate(message);
            } else {
                console.error('Fallback failed: #content not found');
                // Use in-app notification bar
                window.dispatchEvent(
                    new CustomEvent('show-notification', {
                        detail: {
                            title: 'Error',
                            body: message || 'Failed to display story details',
                        },
                    })
                );
            }
            return;
        }
        storyDetailContainer.innerHTML = generatestoryDetailErrorTemplate(message);
    }

    async _renderMap(lat, lon) {
        this.showMapLoading();
        this.#map = await Map.build('#story-map', {
            zoom: 13,
            center: [lat, lon],
        });

        this.#map.addMarker([lat, lon], { alt: 'Lokasi Story' }, { content: 'Lokasi Story' });
        this.hideMapLoading();
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
}