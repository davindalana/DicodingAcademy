import * as UrlParser from '../routes/url-parser';
import * as DicodingAPI from '../data/api';
import { generateLoaderAbsoluteTemplate } from '../templates'
import Map from '../utils/map';
import DetailStoryPresenter from '../presenter/story-detail-presenter';

export default class StoryDetailPage {
    #presenter
    #map

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
        this.#presenter = new DetailStoryPresenter({
            view: this,
            model: DicodingAPI,
        });

        const url = UrlParser.parseActivePathname();
        const storyId = url.id;
        console.log("StoryId: ", storyId);
        console.log("url: ", url);

        await this.#presenter.showStoryDetail(storyId);
    }

    getAccessToken() {
        // ambil dari localStorage atau helper function
        return localStorage.getItem('token');
    }


    displayStoryDetail(story) {
        document.getElementById('story-photo').src = story.photoUrl;
        document.getElementById('story-photo').alt = `Foto oleh ${story.name}`;
        document.getElementById('story-name').textContent = story.name;
        document.getElementById('story-date').textContent = new Date(story.createdAt).toLocaleString();
        document.getElementById('story-description').textContent = story.description;

        if (story.lat !== undefined && story.lon !== undefined) {
            this._renderMap(story.lat, story.lon);
        } else {
            document.getElementById('story-map').textContent = 'Lokasi tidak tersedia.';
        }
    }

    displayStoryError(message) {
        document.querySelector('.story-detail').innerHTML = `<p class="error">${message}</p>`;
    }

    async _renderMap(lat, lon) {
        this.showMapLoading();
        this.#map = await Map.build('#story-map', {
            zoom: 13,
            center: [lat, lon],
        });

        this.#map.addMarker(
            [lat, lon],
            { alt: 'Lokasi Story' },
            { content: 'Lokasi Story' }
        );
        this.hideMapLoading();
    }

    showMapLoading() {
        document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideMapLoading() {
        document.getElementById('map-loading-container').innerHTML = '';
    }

};


