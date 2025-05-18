import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORE_NAME = 'stories';
const DB_VERSION = 1;

// Inisialisasi database
async function initDb() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
}

// Simpan story ke IndexedDB
export async function saveStory(story) {
    const db = await initDb();
    try {
        await db.put(STORE_NAME, story);
        console.log(`Story ${story.id} berhasil disimpan ke IndexedDB`);
    } catch (error) {
        console.error('Gagal menyimpan story ke IndexedDB:', error);
        throw error;
    }
}

// Ambil story berdasarkan ID dari IndexedDB
export async function getStory(storyId) {
    const db = await initDb();
    try {
        const story = await db.get(STORE_NAME, storyId);
        return story || null;
    } catch (error) {
        console.error('Gagal mengambil story dari IndexedDB:', error);
        return null;
    }
}

// Ambil semua story dari IndexedDB
export async function getAllStories() {
    const db = await initDb();
    try {
        const stories = await db.getAll(STORE_NAME);
        return stories || [];
    } catch (error) {
        console.error('Gagal mengambil semua story dari IndexedDB:', error);
        return [];
    }
}

// Hapus story dari IndexedDB
export async function deleteStory(storyId) {
    const db = await initDb();
    try {
        await db.delete(STORE_NAME, storyId);
        console.log(`Story ${storyId} berhasil dihapus dari IndexedDB`);
    } catch (error) {
        console.error('Gagal menghapus story dari IndexedDB:', error);
        throw error;
    }
}

// Periksa apakah story sudah ada di IndexedDB
export async function isStorySaved(storyId) {
    const story = await getStory(storyId);
    return !!story;
}