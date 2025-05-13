export default class AddPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showAddFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showAddFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postAddStory({ description, photo, lat, lon }) {
    this.#view.clearForm(); // ← panggil ini dulu

    // Validasi kosong manual
    let hasError = false;

    if (!description || description.trim() === '') {
      this.#view.showFormError('description', 'Keterangan tidak boleh kosong');
      hasError = true;
    }

    if (!photo || !(photo instanceof File || photo instanceof Blob)) {
      this.#view.showFormError('photo', 'Dokumentasi harus berupa file gambar yang valid');
      hasError = true;
    }

    if (hasError) return;
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description: description,
        photo: photo,
        lat: lat,
        lon: lon,
      };
      const response = await this.#model.addNewStory(data);

      if (!response.ok) {
        console.error('postAddStory: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message, response.data);

    } catch (error) {
      console.error('postAddStory: error:', error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
