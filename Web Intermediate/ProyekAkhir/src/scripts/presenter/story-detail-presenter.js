import { getStoryById } from '../data/api'; // Asumsi path ini benar
import { getStory, saveStory } from '../utils/indexed-db'; // getStory digunakan untuk fetch dari IndexedDB
import { BASE_URL } from '../config'; // Asumsi path ini benar

export default class DetailStoryPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    /**
     * Menampilkan detail cerita.
     * Jika online, data diambil dari API.
     * Jika offline, data diambil dari IndexedDB (jika tersedia).
     * Penyimpanan ke IndexedDB hanya terjadi melalui metode saveStory() yang dipanggil secara manual.
     * @param {string} storyId - ID dari cerita yang akan ditampilkan.
     */
    async showStoryDetail(storyId) {
        try {
            const token = this.#view.getAccessToken(); // Mendapatkan token dari view
            let story;
            let isFromCache = false;

            if (navigator.onLine) {
                console.log(`[DetailStoryPresenter] Online mode. Fetching story ID: ${storyId} from API.`);
                const response = await this.#model.getStoryById(storyId, token);
                console.log('[DetailStoryPresenter] API response:', response);

                if (!response || response.error || !response.story) {
                    throw new Error(response?.message || 'Data story tidak ditemukan dari API');
                }
                story = response.story;
                isFromCache = false;
                // TIDAK ADA PENYIMPANAN OTOMATIS KE INDEXEDDB DI SINI LAGI
                // View akan menampilkan cerita ini dan dapat menawarkan tombol "Simpan"
                // yang akan memanggil presenter.saveStory(story).
            } else {
                console.log(`[DetailStoryPresenter] Offline mode. Attempting to fetch story ID: ${storyId} from IndexedDB.`);
                // Mencoba mengambil cerita dari IndexedDB
                story = await getStory(storyId); // Menggunakan getStory dari utils/indexed-db

                if (!story) {
                    console.warn(`[DetailStoryPresenter] Story ID: ${storyId} not found in IndexedDB.`);
                    throw new Error('Data story tidak tersedia secara offline. Harap online untuk melihat cerita ini, atau simpan cerita saat online untuk akses offline.');
                }
                console.log('[DetailStoryPresenter] Story fetched from IndexedDB:', story);
                isFromCache = true;
            }

            // Menampilkan detail cerita di view
            // View juga perlu menerima objek 'story' ini agar bisa meneruskannya ke metode saveStory jika tombol simpan ditekan.
            this.#view.displayStoryDetail(story, { isFromCache });

        } catch (error) {
            console.error('[DetailStoryPresenter] Error in showStoryDetail:', error.message);
            const errorMessage = error.message || 'Gagal memuat detail story. Periksa koneksi atau coba lagi.';
            this.#view.displayStoryError(errorMessage);
        }
    }

    /**
     * Menyimpan objek cerita ke IndexedDB.
     * Metode ini harus dipanggil oleh View ketika pengguna menekan tombol simpan.
     * @param {object} story - Objek cerita yang akan disimpan.
     */
    async saveStory(story) {
        // Validasi dasar untuk memastikan objek story ada dan memiliki ID
        if (!story || !story.id) {
            console.error('[DetailStoryPresenter] Attempted to save an invalid story object:', story);
            this.#view.showNotification('Gagal menyimpan story: data cerita tidak valid.');
            return;
        }

        try {
            // Menggunakan saveStory dari utils/indexed-db untuk menyimpan ke IndexedDB
            await saveStory(story);
            console.log(`[DetailStoryPresenter] Story ID: ${story.id} saved to IndexedDB successfully.`);
            this.#view.showNotification('Story berhasil disimpan untuk akses offline.');
        } catch (error) {
            console.error('[DetailStoryPresenter] Save story to IndexedDB error:', error);
            this.#view.showNotification('Gagal menyimpan story ke IndexedDB.');
        }
    }
}