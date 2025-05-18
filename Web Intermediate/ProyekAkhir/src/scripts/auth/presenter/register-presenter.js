export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async register({ name, email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.register({ name, email, password });

      if (!response.ok) {
        console.error('register: response:', response);
        this.#view.registeredFailed(response.message);
        return;
      }

      this.#view.registeredSuccessfully(response.message);
    } catch (error) {
      console.error('register: error:', error);
      this.#view.registeredFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
