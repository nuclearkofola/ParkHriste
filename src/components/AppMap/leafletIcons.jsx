import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const selectedIcon = L.divIcon({
  html: '<div class="custom-icon playground-icon"><span>🛝</span></div>',
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});

export const gardenIcon = L.divIcon({
  html: '<div class="custom-icon garden-icon"><span>🖼️</span></div>',
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});
