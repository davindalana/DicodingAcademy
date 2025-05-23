import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORY_STORE_NAME = 'stories';
const PENDING_SYNC_STORE_NAME = 'pending-sync';
const DB_VERSION = 1;

// Initialize database
async function initDb() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Create stories store
            if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
                db.createObjectStore(STORY_STORE_NAME, { keyPath: 'id' });
            }
            // Create pending-sync store for offline POST requests
            if (!db.objectStoreNames.contains(PENDING_SYNC_STORE_NAME)) {
                db.createObjectStore(PENDING_SYNC_STORE_NAME, { keyPath: 'id' });
            }
        },
    });
}

// Save story to IndexedDB
export async function saveStory(story) {
    if (!story || !story.id) {
        throw new Error('Story must have a valid ID');
    }
    const db = await initDb();
    try {
        await db.put(STORY_STORE_NAME, { ...story, updatedAt: Date.now() });
        console.log(`Story ${story.id} successfully saved to IndexedDB`);
    } catch (error) {
        console.error(`Failed to save story ${story.id} to IndexedDB:`, error);
        throw new Error(`Failed to save story: ${error.message}`);
    }
}

// Save pending sync entry (for offline POST requests)
export async function savePendingSync(entry) {
    if (!entry || !entry.id) {
        throw new Error('Pending sync entry must have a valid ID');
    }
    const db = await initDb();
    try {
        await db.put(PENDING_SYNC_STORE_NAME, { ...entry, needsSync: true, createdAt: Date.now() });
        console.log(`Pending sync entry ${entry.id} saved to IndexedDB`);
    } catch (error) {
        console.error(`Failed to save pending sync entry ${entry.id}:`, error);
        throw new Error(`Failed to save pending sync entry: ${error.message}`);
    }
}

// Get story by ID from IndexedDB
export async function getStory(storyId) {
    if (!storyId) {
        console.error('Story ID is required');
        return null;
    }
    const db = await initDb();
    try {
        const story = await db.get(STORY_STORE_NAME, storyId);
        return story || null;
    } catch (error) {
        console.error(`Failed to get story ${storyId} from IndexedDB:`, error);
        return null;
    }
}

// Get all stories from IndexedDB
export async function getAllStories() {
    const db = await initDb();
    try {
        const stories = await db.getAll(STORY_STORE_NAME);
        return stories || [];
    } catch (error) {
        console.error('Failed to get all stories from IndexedDB:', error);
        return [];
    }
}

// Get all pending sync entries
export async function getPendingSyncEntries() {
    const db = await initDb();
    try {
        const entries = await db.getAll(PENDING_SYNC_STORE_NAME);
        return entries || [];
    } catch (error) {
        console.error('Failed to get pending sync entries from IndexedDB:', error);
        return [];
    }
}

// Delete story from IndexedDB
export async function deleteStory(storyId) {
    if (!storyId) {
        throw new Error('Story ID is required');
    }
    const db = await initDb();
    try {
        await db.delete(STORY_STORE_NAME, storyId);
        console.log(`Story ${storyId} successfully deleted from IndexedDB`);
    } catch (error) {
        console.error(`Failed to delete story ${storyId} from IndexedDB:`, error);
        throw new Error(`Failed to delete story: ${error.message}`);
    }
}

// Delete pending sync entry
export async function deletePendingSync(storyId) {
    if (!storyId) {
        throw new Error('Pending sync entry ID is required');
    }
    const db = await initDb();
    try {
        await db.delete(PENDING_SYNC_STORE_NAME, storyId);
        console.log(`Pending sync entry ${storyId} successfully deleted from IndexedDB`);
    } catch (error) {
        console.error(`Failed to delete pending sync entry ${storyId}:`, error);
        throw new Error(`Failed to delete pending sync entry: ${error.message}`);
    }
}

// Check if story exists in IndexedDB
export async function isStorySaved(storyId) {
    if (!storyId) return false;
    const story = await getStory(storyId);
    return !!story;
}