import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './AppMap.css';
import { selectedIcon, gardenIcon } from './leafletIcons';
import { fetchGolemioData } from './api';
import { createPopupContent } from './popupUtils';

// Pomocná komponenta pro přístup k mapě v rámci React-Leaflet
function MapController({ selectedItemType, selectedItemId, gardens, playgrounds, userLocation, setMapCenter, onOpenPanel, setSelectedLayer }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // Pokud je vybrán objekt, najdi a otevři panel
    if (selectedItemType && selectedItemId) {
      const data = selectedItemType === 'garden' ? gardens : playgrounds;
      if (!data || !data.features) return;
      const feature = data.features.find(f => f.properties.id === selectedItemId);
      if (feature && feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        map.setView([lat, lng], 17);
        // Najdi odpovídající layer a zvýrazni ho
        map.eachLayer((layer) => {
          if (layer.feature &&
            layer.feature.properties &&
            layer.feature.properties.id === selectedItemId &&
            layer.feature.properties.type === selectedItemType) {
            setSelectedLayer(layer);
            if (feature.properties.type === 'garden') {
              layer.setIcon?.(gardenIcon);
            } else {
              layer.setIcon?.(selectedIcon);
            }
          }
        });
        onOpenPanel?.(feature);
      }
    } else if (userLocation) {
      // Pokud není vybrán objekt, přibliž na uživatele
      map.setView([userLocation.lat, userLocation.lon], 16);
      setMapCenter && setMapCenter([userLocation.lat, userLocation.lon]);
    }
  }, [map, selectedItemType, selectedItemId, gardens, playgrounds, userLocation, setMapCenter, onOpenPanel, setSelectedLayer]);

  return null;
}

// Komponenta pro zachování středu po změně layoutu (otevření/zavření panelu)
function MapResizer({ isPanelOpen }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const center = map.getCenter();
    // Po DOM layout změně přepočítat velikost a vrátit střed
    setTimeout(() => {
      map.invalidateSize();
      map.setView(center, map.getZoom(), { animate: false });
    }, 0);
  }, [isPanelOpen, map]);
  return null;
}

const AppMap = ({ className, selectedItemType, selectedItemId }) => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([50.0755, 14.4378]);
  const mapRef = useRef(null);

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
  const gardenStyle = { color: '#228B22', weight: 2, opacity: 0.8, fillColor: '#90EE90', fillOpacity: 0.3 };
  const selectedStyle = { color: '#ff0000', weight: 4, opacity: 1, fillOpacity: 0.5 };

  // Mírné oddálení mapy
  const zoomOutSlightly = (map) => {
    if (!map) return;
    const zoom = map.getZoom();
    map.setZoom(Math.max(0, zoom - 1));
  };

  // Otevřít panel s detailem
  const openPanel = (feature, layer) => {
    setSelectedFeature(feature);
    setIsPanelOpen(true);
    if (layer && feature?.geometry?.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates;
      layer._map.setView([lat, lng], 17);
      if (feature.properties.type === 'garden') {
        layer.setIcon?.(gardenIcon);
      } else {
        layer.setIcon?.(selectedIcon);
      }
    }
  };

  // Zavřít panel a mírně oddálit
  const closePanel = (map) => {
    setIsPanelOpen(false);
    setSelectedFeature(null);
    // reset stylu předchozí vybrané vrstvy
    if (selectedLayer) {
      selectedLayer.setStyle?.(selectedLayer.options?.defaultStyle || playgroundStyle);
      selectedLayer.setIcon?.(selectedLayer.feature?.properties.type === 'garden' ? gardenIcon : selectedIcon);
    }
    zoomOutSlightly(map || mapRef.current);
  };

  const handleFeatureClick = (feature, layer) => {
    // Už nepoužíváme Leaflet popup
    layer.on('click', () => {
      const map = layer._map;

      // Klik na stejný prvek = zavřít panel a oddálit
      if (isPanelOpen && selectedFeature?.properties?.id === feature.properties?.id) {
        closePanel(map);
        setSelectedLayer(null);
        return;
      }

      // Resetuje styl předchozí vybrané vrstvy
      if (selectedLayer && selectedLayer !== layer) {
        selectedLayer.setStyle?.(selectedLayer.options.defaultStyle || playgroundStyle);
        selectedLayer.setIcon?.(selectedLayer.feature?.properties.type === 'garden' ? gardenIcon : selectedIcon);
      }

      // Přiblížení a vycentrování mapy na marker/vrstvu
      if (feature.geometry.type === 'Point') {
        map.setView([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
        ], 17);
        layer.setIcon(feature.properties.type === 'garden' ? gardenIcon : selectedIcon);
      } else {
        layer.setStyle(selectedStyle);
      }

      setSelectedLayer(layer);
      openPanel(feature, layer);
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

      {/* Drawer pro mobil (overlay) + panel 1/2 šířky na desktopu */}
      <div className={`drawer drawer-end ${isPanelOpen ? 'md:drawer-open' : ''} h-full`}>
        {/* Řízený toggle pro DaisyUI drawer */}
        <input
          id="map-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isPanelOpen}
          onChange={() => { }}
        />

        <div className="drawer-content h-full">
          <div className="relative h-full transition-all">
            <MapContainer
              whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
              center={mapCenter}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              {/* Reakce na otevření/zavření panelu: zachovat střed a přepočítat velikost */}
              <MapResizer isPanelOpen={isPanelOpen} />

              <MapController
                selectedItemType={selectedItemType}
                selectedItemId={selectedItemId}
                gardens={gardens}
                playgrounds={playgrounds}
                userLocation={userLocation}
                setMapCenter={setMapCenter}
                onOpenPanel={(f) => { setSelectedFeature(f); setIsPanelOpen(true); }}
                setSelectedLayer={setSelectedLayer}
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

              {gardens && <GeoJSON data={gardens} style={gardenStyle} pointToLayer={(f, latlng) => L.marker(latlng, { icon: gardenIcon })} onEachFeature={(f, l) => { f.properties.type = 'garden'; l.options.defaultStyle = gardenStyle; handleFeatureClick(f, l); }} />}
              {playgrounds && <GeoJSON data={playgrounds} style={playgroundStyle} pointToLayer={(f, latlng) => L.marker(latlng, { icon: selectedIcon })} onEachFeature={(f, l) => { f.properties.type = 'playground'; l.options.defaultStyle = playgroundStyle; handleFeatureClick(f, l); }} />}
            </MapContainer>
          </div>
        </div>

        {/* Panel s detailem: mobil = overlay přes celou mapu; desktop = 1/2 šířky */}
        <div className="drawer-side z-[1000]">
          <label
            htmlFor="map-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
            onClick={() => closePanel(mapRef.current)}
          />
          <div className="bg-base-100 text-base-content h-full w-full md:w-[50vw] md:max-w-[50vw] overflow-y-auto relative">
            {/* Mobilní zavírací tlačítko (nahoře) */}
            <button
              type="button"
              aria-label="Zavřít panel"
              className="md:hidden btn btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => closePanel(mapRef.current)}
            >
              ✕
            </button>
            <div className="p-0 md:p-4 pb-20 md:pb-4">
              <div className="flex justify-between items-center mb-3 px-4 md:px-0">
                <h2 className="text-xl md:text-2xl font-bold">Detail</h2>
                <button className="btn btn-sm btn-ghost hidden md:inline-flex" onClick={() => closePanel(mapRef.current)}>Zavřít</button>
              </div>
              <div className="md:card md:bg-base-100 md:shadow-md">
                <div className="md:card-body md:p-0">
                  <div
                    className="prose max-w-none panel-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedFeature
                        ? createPopupContent(selectedFeature)
                        : '<p>Vyberte objekt na mapě…</p>',
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Mobilní zavírací tlačítko dole (sticky) */}
            <div className="md:hidden sticky bottom-0 left-0 right-0 p-3 bg-base-100 border-t shadow-lg">
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => closePanel(mapRef.current)}
              >
                Zavřít panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppMap;
