import { map, tileLayer, Icon, icon, marker, popup, latLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config';

export default class Map {
    #zoom = 5;
    #map = null;

    static async getPlaceNameByCoordinate(latitude, longitude) {
        try {
            const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
            url.searchParams.set('key', MAP_SERVICE_API_KEY);
            url.searchParams.set('language', 'id');
            url.searchParams.set('limit', '1');
            const response = await fetch(url);
            const json = await response.json();
            const place = json.features[0].place_name.split(', ');
            return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
        } catch (error) {
            console.error('getPlaceNameByCoordinate: error:', error);
            return `${latitude}, ${longitude}`;
        }
    }

    static isGeolocationAvailable() {
        return 'geolocation' in navigator;
    }

    static getCurrentPosition(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (!Map.isGeolocationAvailable()) {
                return reject(new Error('Geolocation API unsupported'));
            }
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state === "denied") {
                    return reject(new Error('Akses lokasi ditolak oleh pengguna'))
                }
            } catch (e) {

            }

            navigator.geolocation.getCurrentPosition(resolve, (err) => {
                reject(new Error(err.message));
            }, options);


        });
    }


    static async build(selector, options = {}) {

        const jakartaCoordinate = [-6.2, 106.816666];

        if ('center' in options && options.center) {
            return new Map(selector, options);
        }
        // Using Geolocation API
        if ('locate' in options && options.locate) {
            try {
                const position = await Map.getCurrentPosition();
                const coordinate = [position.coords.latitude, position.coords.longitude];

                console.log("User's location:", coordinate);

                return new Map(selector, {
                    ...options,
                    center: coordinate,
                });
            } catch (error) {
                console.error('Geolocation error:', error);

                return new Map(selector, {
                    ...options,
                    center: jakartaCoordinate,
                });
            }
        }

        return new Map(selector, {
            ...options,
            center: jakartaCoordinate,
        });
    }

    constructor(selector, options = {}) {
        this.#zoom = options.zoom ?? this.#zoom;

        const container = document.querySelector(selector);
        if (!container) throw new Error(`Element ${selector} not found`);
        if (container._leaflet_id) {
            container._leaflet_id = null;
            container.innerHTML = ''; // bersihkan isi sebelumnya
        }


        const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        });

        this.#map = map(document.querySelector(selector), {
            zoom: this.#zoom,
            scrollWheelZoom: false,
            layers: [tileOsm],
            ...options,
        });
    }

    destroy() {
        if (this.map && typeof this.map.remove === 'function') {
            this.map.remove();
            this.map = null;
        }
    }


    changeCamera(coordinate, zoomLevel = null) {
        if (!zoomLevel) {
            this.#map.setView(latLng(coordinate), this.#zoom);
            return;
        }
        this.#map.setView(latLng(coordinate), zoomLevel);
    }

    getCenter() {
        const { lat, lng } = this.#map.getCenter();
        return {
            latitude: lat,
            longitude: lng,
        };
    }



    createIcon(options = {}) {
        return icon({
            ...Icon.Default.prototype.options,
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
            ...options,
        });
    }
    addMarker(coordinates, markerOptions = {}, popupOptions = null) {
        if (typeof markerOptions !== 'object') {
            throw new Error('markerOptions must be an object');
        }
        const newMarker = marker(coordinates, {
            icon: this.createIcon(),
            ...markerOptions,
        });
        if (popupOptions) {
            if (typeof popupOptions !== 'object') {
                throw new Error('popupOptions must be an object');
            }
            if (!('content' in popupOptions)) {
                throw new Error('popupOptions must include `content` property.');
            }
            const newPopup = popup(coordinates, popupOptions);
            newMarker.bindPopup(newPopup);
        }
        newMarker.addTo(this.#map);
        return newMarker;
    }

    addMapEventListener(eventName, callback) {
        this.#map.addEventListener(eventName, callback);
    }
}