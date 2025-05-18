import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoryListEmptyTemplate,
  generateStoryListErrorTemplate,
} from '../templates';
import HomePresenter from '../presenter/home-presenter';
import Map from '../utils/map';
import * as DicodingAPI from '../data/api';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section id ="skip-link">
        <div class="story-list__map__container">
          <div id="map" class="story-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Story</h1>

        <div class="story-list__container">
          <div id="story-list"></div>
          <div id="story-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: DicodingAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      if (this.#map && story.lat && story.lon) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.description };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          date: story.createdAt,
          lat: story.lat,
          lon: story.lon,
        }),
      );
    }, '');

    document.getElementById('story-list').innerHTML = `
      <div class="story-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    document.getElementById('story-list').innerHTML = generateStoryListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById('story-list').innerHTML = generateStoryListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 4,
      center: [-2.5489, 118.0149], // Koordinat tengah Indonesia
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('story-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('story-list-loading-container').innerHTML = '';
  }
}
