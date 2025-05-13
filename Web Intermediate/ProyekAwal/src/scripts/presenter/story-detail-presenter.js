export default class DetailStoryPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async showStoryDetail(storyId) {
        try {
            const token = this.#view.getAccessToken();
            const response = await this.#model.getStoryById(storyId, token);

            if (!response || !response.story) {
                throw new Error('Data story tidak ditemukan');
            }

            this.#view.displayStoryDetail(response.story);
        } catch (error) {
            console.error('Detail DetailStoryPresenter: error:', error);
            this.#view.displayStoryError(error.message);
        }
    }
}