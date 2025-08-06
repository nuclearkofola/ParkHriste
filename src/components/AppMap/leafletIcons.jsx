import L from 'leaflet';
// ikona aktualní polohy
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  html: '<div class="custom-icon playground-icon"><span>😁</span></div>',
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});
// ikona hriste
export const selectedIcon = L.divIcon({
  html: '<div class="custom-icon playground-icon"><span>🛝</span></div>',
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});
// ikona parku
export const gardenIcon = L.divIcon({
  html: '<div class="custom-icon garden-icon"><span>🖼️</span></div>',
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});
