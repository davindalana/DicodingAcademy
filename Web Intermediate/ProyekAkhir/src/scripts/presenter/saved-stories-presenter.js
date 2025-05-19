import { saveStory, deleteStory, isStorySaved } from '../utils/indexed-db';

export default class SaveStoriesPresenter {
    #view;

    constructor({ view }) {
        this.#view = view;
    }

    async saveStory(story) {
        if (!story) {
            throw new Error('Tidak ada data story untuk disimpan');
        }
        try {
            await saveStory(story);
            this.#view.showNotification({
                title: 'Berhasil',
                body: 'Story disimpan untuk offline',
            });
        } catch (error) {
            console.error('SaveStoriesPresenter: error saving story:', error);
            this.#view.showNotification({
                title: 'Gagal',
                body: 'Gagal menyimpan story',
            });
            throw error;
        }
    }

    async deleteStory(storyId) {
        if (!storyId) {
            throw new Error('ID story tidak valid');
        }
        try {
            await deleteStory(storyId);
            this.#view.showNotification({
                title: 'Berhasil',
                body: 'Story dihapus dari penyimpanan offline',
            });
        } catch (error) {
            console.error('SaveStoriesPresenter: error deleting story:', error);
            this.#view.showNotification({
                title: 'Gagal',
                body: 'Gagal menghapus story',
            });
            throw error;
        }
    }

    async isStorySaved(storyId) {
        try {
            return await isStorySaved(storyId);
        } catch (error) {
            console.error('SaveStoriesPresenter: error checking story:', error);
            return false;
        }
    }
}