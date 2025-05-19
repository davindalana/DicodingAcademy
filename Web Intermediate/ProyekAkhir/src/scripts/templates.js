import { _localizeDate } from './utils/index';

const formatDate = (dateString, locale = 'id-ID') => {
  if (!dateString) return 'Tanggal tidak tersedia';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Loader template
export function generateLoaderTemplate() {
  return `
    <div class="loader" role="status" aria-label="Memuat"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute" role="status" aria-label="Memuat"></div>
  `;
}

// Navigation templates
export function generateMainNavigationListTemplate() {
  return `
    <li><a id="story-list-button" class="story-list-button" href="#/">Daftar Story</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools">
      ${generateSubscribeButtonTemplate()}
    </li>
    <li><a id="guest-button" href="#/guest">Guest</a></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools">
      ${generateSubscribeButtonTemplate()}
      ${generateUnsubscribeButtonTemplate()}
    </li>
    <li><a id="saved-stories-button" href="#/saved">Story Tersimpan</a></li>
    <li><a id="add-story-button" class="btn add-story-button" href="#/add">Buat Story <i class="fas fa-plus" aria-hidden="true"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout</a></li>
  `;
}

// Story list templates
export function generateStoryListEmptyTemplate() {
  return `
    <div id="story-list-empty" class="story-list__empty">
      <h2>Tidak ada Story yang tersedia</h2>
      <p>Saat ini, tidak ada Story kerusakan fasilitas umum yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoryListErrorTemplate(message) {
  return `
    <div id="story-list-error" class="story-list__error">
      <h2>Terjadi kesalahan pengambilan daftar Story</h2>
      <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="story-detail-error" class="story-detail__error">
      <h2>Terjadi kesalahan pengambilan detail Story</h2>
      <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

// Notification bar template
export function generateNotificationBarTemplate({ title, body, id }) {
  return `
    <div id="notification-${id}" class="notification-bar" role="alert">
      <div class="notification-bar__content">
        <h3 class="notification-bar__title">${title}</h3>
        <p class="notification-bar__body">${body}</p>
      </div>
      <button class="notification-bar__close" aria-label="Tutup notifikasi">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

// Story item template
export function generateStoryItemTemplate({
  id,
  description,
  photoUrl,
  name,
  date,
  lat,
  lon,
}) {
  const imageUrl = photoUrl || 'images/placeholder-image.jpg';
  const createdAt = date ? _localizeDate(date) : 'Tanggal tidak tersedia';
  const location = (lat !== undefined && lon !== undefined) ? `${lat}, ${lon}` : 'Tidak diketahui';

  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${imageUrl}" alt="Foto kerusakan oleh ${name}">
      <div class="story-item__body">
        <h2 class="story-item__title">${name}</h2>
        <div class="story-item__meta">
          <div><i class="fas fa-user" aria-hidden="true"></i> ${name}</div>
          <div><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${createdAt}</div>
        </div>
        <div class="story-item__location">
          <i class="fas fa-map" aria-hidden="true"></i> ${location}
        </div>
        <p class="story-item__description">${description}</p>
        <a class="btn story-item__read-more" href="#/stories/${id}">Selengkapnya</a>
      </div>
    </div>
  `;
}

// Story detail image template
export function generateStoryDetailImageTemplate(imageUrl = null, alt = '') {
  if (!imageUrl) {
    return `
      <img class="story-detail__image" src="images/placeholder-image.jpg" alt="Placeholder Image">
    `;
  }

  return `
    <img class="story-detail__image" src="${imageUrl}" alt="${alt}">
  `;
}

// Story detail template
export function generateStoryDetailTemplate({
  title,
  description,
  photoUrlImages,
  lat,
  lon,
  name,
  createdAt,
}) {
  const createdAtFormatted = formatDate(createdAt, 'id-ID');
  const imagesHtml = photoUrlImages.reduce(
    (accumulator, photoUrlImage) =>
      accumulator + generateStoryDetailImageTemplate(photoUrlImage, title),
    '',
  );

  return `
    <div class="story-detail__header">
      <h1 id="title" class="story-detail__title">${title}</h1>

      <div class="story-detail__more-info">
        <div class="story-detail__more-info__inline">
          <div id="createdat" class="story-detail__createdat" data-value="${createdAtFormatted}">
            <i class="fas fa-calendar-alt" aria-hidden="true"></i> ${createdAtFormatted}
          </div>
        </div>
        <div class="story-detail__more-info__inline">
          <div id="location-latitude" class="story-detail__location__latitude" data-value="${lat}">Latitude: ${lat || 'Tidak diketahui'}</div>
          <div id="location-longitude" class="story-detail__location__longitude" data-value="${lon}">Longitude: ${lon || 'Tidak diketahui'}</div>
        </div>
        <div id="author" class="story-detail__author" data-value="${name}">Dilaporkan oleh: ${name || 'Anonim'}</div>
      </div>
    </div>

    <div class="container">
      <div class="story-detail__images__container">
        <div id="images" class="story-detail__images">${imagesHtml}</div>
      </div>
    </div>

    <div class="container">
      <div class="story-detail__body">
        <div class="story-detail__body__description__container">
          <h2 class="story-detail__description__title">Informasi Lengkap</h2>
          <div id="description" class="story-detail__description__body">
            ${description || 'Deskripsi tidak tersedia.'}
          </div>
        </div>
        <div class="story-detail__body__map__container">
          <h2 class="story-detail__map__title">Peta Lokasi</h2>
          <div class="story-detail__map__container">
            <div id="map" class="story-detail__map"></div>
            <div id="map-loading-container">${generateLoaderAbsoluteTemplate()}</div>
          </div>
        </div>
  
        <hr>
  
        <div class="story-detail__body__actions__container">
          <h2>Aksi</h2>
          <div class="story-detail__actions__buttons">
            <div id="save-actions-container"></div>
            <div id="notify-me-actions-container">
              <button id="story-detail-notify-me" class="btn btn-transparent">
                Notify Me <i class="far fa-bell" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Push notification button templates
export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button" aria-label="Berlangganan notifikasi">
      Subscribe <i class="fas fa-bell" aria-hidden="true"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button" aria-label="Batalkan langganan notifikasi">
      Unsubscribe <i class="fas fa-bell-slash" aria-hidden="true"></i>
    </button>
  `;
}