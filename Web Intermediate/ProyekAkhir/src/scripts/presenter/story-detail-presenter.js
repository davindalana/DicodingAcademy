import { getStoryById } from '../data/api';
import { getStory, saveStory } from '../utils/indexed-db';

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

            let story;
            if (navigator.onLine) {
                const response = await this.#model.getStoryById(storyId, token);
                if (!response || response.error || !response.story) {
                    throw new Error(response?.message || 'Data story tidak ditemukan');
                }
                story = response.story;
            } else {
                story = await getStory(storyId);
                if (!story) {
                    throw new Error('Data story tidak tersedia secara offline');
                }
            }

            this.#view.displayStoryDetail(story);
        } catch (error) {
            console.error('DetailStoryPresenter: error:', error);
            // Coba ambil dari IndexedDB sebagai fallback
            if (!navigator.onLine) {
                const cachedStory = await getStory(storyId);
                if (cachedStory) {
                    this.#view.displayStoryDetail(cachedStory);
                    return;
                }
            }
            this.#view.displayStoryError(error.message || 'Gagal memuat detail story');
        }
    }
}