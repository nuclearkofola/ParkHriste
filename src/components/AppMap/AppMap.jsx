import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Polyline } from 'react-leaflet';
import './AppMap.css';
import { selectedIcon, gardenIcon } from './leafletIcons';
import { fetchGolemioData } from './api';
import { createPopupContent } from './popupUtils';

// Pomocná komponenta pro přístup k mapě v rámci React-Leaflet
function MapController({ selectedItemType, selectedItemId, gardens, playgrounds, userLocation, setMapCenter }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    // Pokud je vybrán objekt, najdi a otevři popup
    if (selectedItemType && selectedItemId) {
      const data = selectedItemType === 'garden' ? gardens : playgrounds;
      if (!data || !data.features) return;
      const feature = data.features.find(f => f.properties.id === selectedItemId);
      if (feature && feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        map.setView([lat - 0.0005, lng + 0.001], 17);
        setTimeout(() => {
          map.eachLayer((layer) => {
            if (layer.feature && 
                layer.feature.properties && 
                layer.feature.properties.id === selectedItemId &&
                layer.feature.properties.type === selectedItemType) {
              if (layer.getPopup()) {
                layer.openPopup();
              } else {
                layer.bindPopup(createPopupContent(feature), popupOptions).openPopup();
              }
            }
          });
        }, 500);
      }
    } else if (userLocation) {
      // Pokud není vybrán objekt, přibliž na uživatele
      map.setView([userLocation.lat, userLocation.lon], 16);
      setMapCenter && setMapCenter([userLocation.lat, userLocation.lon]);
    }
  }, [map, selectedItemType, selectedItemId, gardens, playgrounds, userLocation, setMapCenter]);

  return null;
}

const AppMap = ({ className, selectedItemType, selectedItemId }) => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([50.0755, 14.4378]);
  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;
  // Získání aktuální polohy uživatele
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!apiKey) return setError("API klíč není nastaven");

      try {
        const [gardensData, playgroundsData] = await Promise.all([
          fetchGolemioData("/v2/gardens", apiKey),
          fetchGolemioData("/v2/playgrounds", apiKey),
        ]);
        
        setGardens(gardensData);
        setPlaygrounds(playgroundsData);
      } catch (e) {
        setError("Chyba při načítání dat");
      }
    };

    loadData();
  }, [apiKey]);

  const playgroundStyle = { color: '#0000ff', weight: 2, opacity: 0.8 };
  const selectedStyle = { color: '#ff0000', weight: 4, opacity: 1, fillOpacity: 0.5 };

  const popupOptions = {
    offset: L.point(-50, 0),  // Menší offset, aby popup byl blíže k bodu
    autoPan: true,
    autoPanPadding: [50, 50],
    keepInView: true,
    maxWidth: 250,            // Omezení šířky
    maxHeight: 250,           // Omezení výšky
    className: 'custom-popup' // Volitelně - třída pro další CSS úpravy
  };

  const handleFeatureClick = (feature, layer) => {
    // Vytvoří popup s upravenými nastaveními
    layer.bindPopup(createPopupContent(feature), popupOptions);
    
    // Přidá obsluhu události mouseover pro zobrazení popupu při najetí myší
    layer.on('mouseover', () => {
      layer.openPopup();
    });
    
    layer.on('click', () => {
      // Resetuje styl předchozí vybrané vrstvy
      if (selectedLayer && selectedLayer !== layer) {
        selectedLayer.setStyle?.(selectedLayer.options.defaultStyle || playgroundStyle);
        selectedLayer.setIcon?.(selectedLayer.feature?.properties.type === 'garden' ? gardenIcon : selectedIcon);
      }
      
      // Nastavuje vzhled aktuální vybrané vrstvy
      if (feature.geometry.type === 'Point') {
        // Přiblížení na vhodný zoom level pro detailní pohled
        map.setView([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
        ], 17); // Větší zoom pro lepší detail
        
        layer.setIcon(feature.properties.type === 'garden' ? gardenIcon : selectedIcon);
      } else {
        layer.setStyle(selectedStyle);
      }
      
      // Aktualizuje vybranou vrstvu a otevře popup
      setSelectedLayer(layer);
      layer.openPopup();
    });
  };

  // Najdi vybraný objekt pro případné vykreslení čáry
  let selectedCoords = null;
  if (selectedItemType && selectedItemId) {
    const data = selectedItemType === 'garden' ? gardens : playgrounds;
    const feature = data?.features?.find(f => f.properties.id === selectedItemId);
    if (feature && feature.geometry.type === 'Point') {
      selectedCoords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    }
  }

  return (
    <div className={`relative ${className}`}>
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}
      <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
        <MapController 
          selectedItemType={selectedItemType} 
          selectedItemId={selectedItemId}
          gardens={gardens}
          playgrounds={playgrounds}
          userLocation={userLocation}
          setMapCenter={setMapCenter}
        />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {/* Marker aktuální polohy */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={L.divIcon({
            html: '<div class="custom-icon user-icon"><span>📍</span></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            className: ''
          })} />
        )}
        {/* Čára mezi uživatelem a vybraným objektem */}
        {userLocation && selectedCoords && (
          <Polyline positions={[[userLocation.lat, userLocation.lon], selectedCoords]} color="#00bcd4" weight={3} dashArray="6 6" />
        )}
        {gardens && <GeoJSON data={gardens} pointToLayer={(f, latlng) => L.marker(latlng, { icon: gardenIcon })} onEachFeature={(f, l) => { f.properties.type = 'garden'; handleFeatureClick(f, l); }} />}
        {playgrounds && <GeoJSON data={playgrounds} style={playgroundStyle} pointToLayer={(f, latlng) => L.marker(latlng, { icon: selectedIcon })} onEachFeature={(f, l) => { f.properties.type = 'playground'; l.options.defaultStyle = playgroundStyle; handleFeatureClick(f, l); }} />}
      </MapContainer>
    </div>
  );
};

export default AppMap;
