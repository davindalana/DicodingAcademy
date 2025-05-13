export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGalleryAndMap() {
    try {
      this.#view.showMapLoading();
      await this.#view.initialMap();
      this.#view.hideMapLoading();

      this.#view.showLoading();
      const response = await this.#model.getAllStories();

      if (!response.ok) {
        this.#view.populateStoriesListError(response.message);
        return;
      }

      const stories = response.listStory || [];
      this.#view.populateStoriesList(response.message, stories);
    } catch (error) {
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
