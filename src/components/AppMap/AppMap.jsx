import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import './AppMap.css';
import { selectedIcon, gardenIcon } from './leafletIcons';
import { fetchGolemioData } from './api';
import { createPopupContent } from './popupUtils';

const AppMap = () => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
  const loadData = async () => {
    if (!apiKey) return setError("API klíč není nastaven");

    const gardensData = await fetchGolemioData("/v2/gardens", apiKey);
    const playgroundsData = await fetchGolemioData("/v2/playgrounds", apiKey);

    console.log("🪴 Gardens:", gardensData);
    console.log("🏀 Playgrounds:", playgroundsData);

    setGardens(gardensData);
    setPlaygrounds(playgroundsData);
  };

  loadData();
}, [apiKey]);

  const playgroundStyle = { color: '#0000ff', weight: 2, opacity: 0.8 };
  const selectedStyle = { color: '#ff0000', weight: 4, opacity: 1, fillOpacity: 0.5 };

  const handleFeatureClick = (feature, layer) => {
    layer.bindPopup(createPopupContent(feature));
    layer.on('click', () => {
      if (selectedLayer && selectedLayer !== layer) {
        selectedLayer.setStyle?.(selectedLayer.options.defaultStyle || playgroundStyle);
        selectedLayer.setIcon?.(selectedLayer.feature?.properties.type === 'garden' ? gardenIcon : selectedIcon);
      }
      if (feature.geometry.type === 'Point') {
        layer.setIcon(feature.properties.type === 'garden' ? gardenIcon : selectedIcon);
      } else {
        layer.setStyle(selectedStyle);
      }
      setSelectedLayer(layer);
      layer.openPopup();
    });
  };

  return (
    <div className="relative">
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}
      <MapContainer center={[50.0755, 14.4378]} zoom={11} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {gardens && <GeoJSON data={gardens} pointToLayer={(f, latlng) => L.marker(latlng, { icon: gardenIcon })} onEachFeature={(f, l) => { f.properties.type = 'garden'; handleFeatureClick(f, l); }} />}
        {playgrounds && <GeoJSON data={playgrounds} style={playgroundStyle} pointToLayer={(f, latlng) => L.marker(latlng, { icon: selectedIcon })} onEachFeature={(f, l) => { f.properties.type = 'playground'; l.options.defaultStyle = playgroundStyle; handleFeatureClick(f, l); }} />}
      </MapContainer>
    </div>
  );
};

export default AppMap;
