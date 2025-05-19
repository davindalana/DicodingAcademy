import { 
  generateStoryItemTemplate, 
  generateStoryListEmptyTemplate, 
  generateStoryListErrorTemplate 
} from '../templates';
import { getAllStories } from '../utils/indexed-db';

export default class SavedStoriesPage {
  async render() {
    try {
      const stories = await getAllStories();
      if (!stories || stories.length === 0) {
        return generateStoryListEmptyTemplate();
      }
      return `
        <section class="saved-stories">
          <h2>Story Tersimpan</h2>
          <div class="story-list">
            ${stories.map((story) => generateStoryItemTemplate(story)).join('')}
          </div>
        </section>
      `;
    } catch (error) {
      return generateStoryListErrorTemplate('Gagal memuat story tersimpan');
    }
  }

  async afterRender() {
    // Tambahkan logika tambahan jika diperlukan
  }
};
