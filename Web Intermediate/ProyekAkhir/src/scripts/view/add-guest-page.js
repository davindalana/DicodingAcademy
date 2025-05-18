import AddPresenter from '../presenter/add-guest-presenter';
import { convertBase64ToBlob } from '../utils';
import * as DicodingAPI from '../data/api';
import { generateLoaderAbsoluteTemplate } from '../templates';
import Camera from '../utils/camera';
import Map from '../utils/map';

export default class AddGuestPage {
    #presenter;
    #form;
    #camera;
    #isCameraOpen = false;
    #takenDocumentations = [];
    #map = null;

    async render() {
        return `
<section>
    <div class="add-story__header">
        <div class="container">
            <h1 class="add-story__header__title">Buat Story Baru</h1>
            <p class="add-story__header__description">
                Silakan lengkapi formulir di bawah untuk membuat story baru.<br>
                Pastikan story yang dibuat adalah valid.
            </p>
        </div>
    </div>
</section>

<section class="container">
    <div class="add-form__container">
        <form id="add-form" class="add-form">
            <div class="form-control">
                <label for="description-input" class="add-form__description__title">Keterangan</label>

                <div class="add-form__description__container">
                    <textarea id="description-input" name="description"
                        placeholder="Masukkan keterangan lengkap story. Anda dapat menjelaskan apa kejadiannya, dimana, kapan, dll."></textarea>
                    <small id="description-error" class="form-error-message"></small>
                </div>
            </div>
            <div class="form-control">
                <label for="documentations-input" class="add-form__documentations__title">Dokumentasi</label>
                <div id="documentations-more-info">Anda dapat menyertakan foto sebagai dokumentasi.</div>
                <small id="photo-error" class="form-error-message"></small>

                <div class="add-form__documentations__container">
                    <div class="add-form__documentations__buttons">
                        <button id="documentations-input-button" class="btn btn-outline" type="button">
                            Ambil Gambar
                        </button>
                        <input id="documentations-input" name="documentations" type="file" accept="image/*" multiple
                            hidden="hidden" aria-multiline="true" aria-describedby="documentations-more-info">
                        <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                            Buka Kamera
                        </button>
                    </div>
                    <div id="camera-container" class="add-form__camera__container">
                        <video id="camera-video" class="add-form__camera__video">
                            Video stream not available.
                        </video>
                        <canvas id="camera-canvas" class="add-form__camera__canvas"></canvas>

                        <div class="add-form__camera__tools">
                            <select id="camera-select"></select>
                            <div class="add-form__camera__tools_buttons">
                                <button id="camera-take-button" class="btn" type="button">
                                    Ambil Gambar
                                </button>
                            </div>
                        </div>
                    </div>
                    <ul id="documentations-taken-list" class="add-form__documentations__outputs"></ul>
                </div>
            </div>
            <div class="form-control">
                <div class="add-form__location__title">Lokasi</div>

                <div class="add-form__location__container">
                    <div class="add-form__location__map__container">
                        <div id="map" class="add-form__location__map"></div>
                        <div id="map-loading-container"></div>
                    </div>
                    <div class="add-form__location__lat-lng">
                        <input type="number" name="latitude" value="-6.175389" step="any" aria-label="nilai latitude">
                        <input type="number" name="longitude" value="106.827139" step="any" aria-label="nilai longitude">
                    </div>
                </div>
            </div>
            <div class="form-buttons">
                <span id="submit-button-container">
                    <button class="btn" type="submit">Buat Story</button>
                </span>
                <a class="btn btn-outline" href="#/">Batal</a>
            </div>
        </form>
    </div>
</section>     
`;
    }

    async afterRender() {
        this.#presenter = new AddPresenter({
            view: this,
            model: DicodingAPI,
        });
        this.#takenDocumentations = [];

        this.#setupForm();
        await this.#presenter.showAddFormMap();
    }

    async #setupForm() {
        this.#form = document.getElementById('add-form');
        this.#form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = {
                description: this.#form.elements.namedItem('description').value,
                photo: this.#takenDocumentations[0]?.blob, // Ambil foto yang telah diambil
                lat: this.#form.elements.namedItem('latitude').value,
                lon: this.#form.elements.namedItem('longitude').value,
            };

            // Panggil presenter untuk mengirimkan data story tanpa autentikasi
            await this.#presenter.postAddStory(data);
        });

        document.getElementById('documentations-input').addEventListener('change', async (event) => {
            const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
                return await this.#addTakenPicture(file);
            });
            await Promise.all(insertingPicturesPromises);
            await this.#populateTakenPictures();
        });

        document.getElementById('documentations-input-button').addEventListener('click', () => {
            this.#form.elements.namedItem('documentations-input').click();
        });

        const cameraContainer = document.getElementById('camera-container');
        document
            .getElementById('open-documentations-camera-button')
            .addEventListener('click', async (event) => {
                cameraContainer.classList.toggle('open');
                this.#isCameraOpen = cameraContainer.classList.contains('open');

                if (this.#isCameraOpen) {
                    event.currentTarget.textContent = 'Tutup Kamera';
                    this.#setupCamera();
                    await this.#camera.launch();
                    return;
                }

                event.currentTarget.textContent = 'Buka Kamera';
                this.#camera.stop();
            });
    }

    async initialMap() {
        this.#map = await Map.build('#map', {
            zoom: 15,
            locate: true,
        });

        // Preparing marker for select coordinate
        const centerCoordinate = this.#map.getCenter();

        this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

        const draggableMarker = this.#map.addMarker(
            [centerCoordinate.latitude, centerCoordinate.longitude],
            { draggable: 'true' },
        );

        draggableMarker.addEventListener('move', (event) => {
            const coordinate = event.target.getLatLng();
            this.#updateLatLngInput(coordinate.lat, coordinate.lng);
        });

        this.#map.addMapEventListener('click', (event) => {
            draggableMarker.setLatLng(event.latlng);

            // Keep center with user view
            event.sourceTarget.flyTo(event.latlng);
        });


    }

    #updateLatLngInput(lat, long) {
        this.#form.elements.namedItem('latitude').value = Number(lat).toFixed(6);
        this.#form.elements.namedItem('longitude').value = Number(long).toFixed(6);
    }

    #setupCamera() {
        if (!this.#camera) {
            this.#camera = new Camera({
                video: document.getElementById('camera-video'),
                cameraSelect: document.getElementById('camera-select'),
                canvas: document.getElementById('camera-canvas'),
            });
        }

        this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
            const image = await this.#camera.takePicture();
            await this.#addTakenPicture(image);
            await this.#populateTakenPictures();
        });

        const takePictureButton = document.getElementById('documentations-input-button');
        if (takePictureButton) {
            takePictureButton.disabled = false;  // Enable tombol setelah foto dihapus
        }

    }

    async #addTakenPicture(image) {
        let blob = image;

        if (image instanceof String) {
            blob = await convertBase64ToBlob(image, 'image/png');
        }

        const newDocumentation = {
            id: `${Date.now()} -${Math.random().toString(36).substring(2, 9)} `,
            blob: blob,
        };
        this.#takenDocumentations = [newDocumentation];
    }

    async #populateTakenPictures() {
        const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
            const imageUrl = URL.createObjectURL(picture.blob);
            return accumulator.concat(`
            <li class="add-form__documentations__outputs-item">
                <button type="button" data-deletepictureid="${picture.id}" class="add-form__documentations__outputs-item__delete-btn" aria-label="Menghapus Dokumen">
                    <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
                </button>
            </li >
            `);
        }, '');

        document.getElementById('documentations-taken-list').innerHTML = html;

        const takePictureButton = document.getElementById('documentations-input-button');
        if (takePictureButton) {
            takePictureButton.disabled = false;
        }

        document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
            button.addEventListener('click', (event) => {
                const pictureId = event.currentTarget.dataset.deletepictureid;
                this.#removePicture(pictureId);
                this.#populateTakenPictures();
            }),
        );
    }


    #removePicture(id) {
        const selectedPicture = this.#takenDocumentations.find((picture) => picture.id == id);

        if (!selectedPicture) {
            return null;
        }

        this.#takenDocumentations = this.#takenDocumentations.filter((picture) => picture.id != selectedPicture.id);

        const fileInput = document.getElementById('documentations-input');
        if (fileInput) {
            fileInput.value = ''; // Reset file input jika sudah ada file sebelumnya
        }

        this.#populateTakenPictures();

        return selectedPicture;
    }

    async storeSuccessfully(message) {
        console.log(message);
        this.clearForm();

        await new Promise(resolve => setTimeout(resolve, 0)); // Delay eksekusi

        location.hash = '/login';   
    }

    storeFailed(message) {
        if (message.includes('"description" is not allowed to be empty')) {
            this.showFormError('description', 'Keterangan tidak boleh kosong');
        } else if (message.includes('"photo"')) {
            this.showFormError('photo', 'Dokumentasi harus diunggah');
        } else {
            const globalError = document.getElementById('global-error');
            if (globalError) {
                globalError.textContent = message;
                globalError.style.display = 'block';
            }
        }
    }

    showFormError(field, message) {
        const input = this.#form.elements.namedItem(field);
        const errorElement = document.getElementById(`${field}-error`);

        if (input) {
            input.classList.add('input-error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearForm() {
        const errorElements = this.#form.querySelectorAll('.form-error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });

        const erroredInputs = this.#form.querySelectorAll('.input-error');
        erroredInputs.forEach(input => input.classList.remove('input-error'));

        const globalError = document.getElementById('global-error');
        if (globalError) {
            globalError.style.display = 'none';
            globalError.textContent = '';
        }
    }

    showMapLoading() {
        document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }

    hideMapLoading() {
        document.getElementById('map-loading-container').innerHTML = '';
    }

    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type = "submit" disabled>
                <i class="fas fa-spinner loader-button"></i> Buat Story
            </button>
            `;
    }

    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type = "submit"> Buat Story</button>
                `;
    }
}
