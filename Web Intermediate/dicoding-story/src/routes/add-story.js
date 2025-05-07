import { getToken } from '../utils/token';

const addStory = {
  async render(container) {
    container.innerHTML = `
      <main id="main">
        <h1>Tambah Story</h1>
        <form id="storyForm">
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>
          <label for="photo">Foto:</label>
          <input type="file" id="photo" accept="image/*" required />
          <button type="submit">Kirim</button>
        </form>
      </main>
    `;

    document.getElementById('storyForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = getToken();
      if (!token) return alert('Anda belum login.');

      const formData = new FormData();
      formData.append('description', document.getElementById('description').value);
      formData.append('photo', document.getElementById('photo').files[0]);

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const result = await response.json();
        if (!result.error) {
          alert('Story berhasil ditambahkan!');
          window.location.hash = '/home';
        } else {
          alert('Gagal menambahkan: ' + result.message);
        }
      } catch (err) {
        alert('Kesalahan jaringan.');
      }
    });
  }
};

export default addStory;