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
      const response = await this.#model.getAllReports();

      if (!response.ok) {
        this.#view.populateReportsListError(response.message);
        return;
      }

      const stories = response.listStory || [];
      this.#view.populateReportsList(response.message, stories);
    } catch (error) {
      this.#view.populateReportsListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}