// Initialize map
const gedungSateCoor = [-6.9025, 107.6191];
const myMap = L.map('map', {
  zoom: 15,
  center: gedungSateCoor,
  scrollWheelZoom: false,
});
 
// Set base map
const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmTile = L.tileLayer(osmTileUrl, {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
});
// osmTile.addTo(myMap);
// Add MapTiler layer
const mtLayer = L.maptilerLayer({
  apiKey: 'eQNu3EL5gDOHBlLylbNB',
  style: 'https://api.maptiler.com/maps/019693ef-1380-7b69-947e-51df5c2afaec/style.json?key=kZiL30JUUIlmjkmC2GFQ', // Optional
});
mtLayer.addTo(myMap);