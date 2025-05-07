import { getToken } from '../../utils/token.js';
import navBar from '../views/navbar.js';

const home = {
    async render(container) {
        container.innerHTML = `
            ${navBar()}
          <main id="main">
            <h1>Stories</h1>
            <div id="stories"></div>
          </main>`;
        const token = getToken();

        if (!token) {
            container.innerHTML = '<p>Silakan login terlebih dahulu.</p>';
            return;
        }

        try {
            const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            const storyContainer = document.getElementById('stories');
            storyContainer.innerHTML = data.listStory.map((story) => `
        <div class="story">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <img src="${story.photoUrl}" alt="${story.name}" width="200"/>
          <small>${new Date(story.createdAt).toLocaleString()}</small>
        </div>
      `).join('');
        } catch (err) {
            container.innerHTML = '<p>Gagal memuat cerita.</p>';
        }
    }
};

export default home;