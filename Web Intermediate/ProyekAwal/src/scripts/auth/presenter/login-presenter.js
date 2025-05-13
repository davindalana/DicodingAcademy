export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async login({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.login({ email, password });

      if (!response.ok) {
        console.error('login: response:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      if (response.loginResult && response.loginResult.token) {
        this.#authModel.putAccessToken(response.loginResult.token);
        this.#view.loginSuccessfully(response.message, response.loginResult);
      } else {
        this.#view.loginFailed(response.message || 'Login gagal, data tidak valid.');
      }
      

      this.#view.loginSuccessfully(response.message, response.loginResult);
    } catch (error) {
      console.error('login: error:', error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
