import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Oprava pro ikony Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Vlastní ikona pro zvýrazněné body
const selectedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 48], // Větší ikona pro zvýraznění
  iconAnchor: [15, 48],
  popupAnchor: [0, -48],
});

// Funkce pro načtení dat z Golemio API
const fetchGolemioData = async (endpoint, apiKey) => {
  try {
    const response = await fetch(`https://api.golemio.cz${endpoint}`, {
      headers: {
        'x-access-token': apiKey,
      },
    });

    console.log(`Endpoint: ${endpoint}, Status: ${response.status}`);
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Chyba ${response.status}: ${errorText}`);
      throw new Error(`Chyba při načítání dat z ${endpoint}: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error(`Neplatný formát odpovědi z ${endpoint}: ${errorText}`);
      throw new Error(`Odpověď z ${endpoint} není JSON`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chyba při fetch:', error);
    return null;
  }
};

// Hlavní komponenta AppMap
const AppMap = () => {
  const [cityDistricts, setCityDistricts] = useState(null);
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Načtení městských částí
        const districtsData = await fetchGolemioData('/v2/citydistricts', apiKey);
        console.log('Městské části:', districtsData);
        setCityDistricts(districtsData);

        // Načtení zahrad
        const gardensData = await fetchGolemioData('/v2/gardens', apiKey);
        console.log('Zahrady:', gardensData);
        setGardens(gardensData);

        // Načtení hřišť
        const playgroundsData = await fetchGolemioData('/v2/playgrounds', apiKey);
        console.log('Hřiště:', playgroundsData);
        setPlaygrounds(playgroundsData);
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
  }, [apiKey]);

  // Styly pro GeoJSON vrstvy
  const districtStyle = {
    color: '#ff7800',
    weight: 2,
    opacity: 0.65,
  };

  const gardenStyle = {
    color: '#00ff00',
    weight: 2,
    opacity: 0.8,
  };

  const playgroundStyle = {
    color: '#0000ff',
    weight: 2,
    opacity: 0.8,
  };

  // Styl pro zvýrazněnou vrstvu (pro polygony)
  const selectedStyle = {
    color: '#ff0000',
    weight: 4,
    opacity: 1,
  };

  // Funkce pro vytvoření popupu
  const createPopupContent = (properties) => {
    if (!properties) {
      return '<div><h3>Není název</h3><p>Žádné informace</p></div>';
    }

    const { name, address, description, type, equipment, surface } = properties;
    const info = [
      name && `<p><strong>Název:</strong> ${name}</p>`,
      address && `<p><strong>Adresa:</strong> ${address}</p>`,
      description && `<p><strong>Popis:</strong> ${description}</p>`,
      type && `<p><strong>Typ:</strong> ${type}</p>`,
      equipment && `<p><strong>Vybavení:</strong> ${equipment}</p>`,
      surface && `<p><strong>Povrch:</strong> ${surface}</p>`,
    ].filter(Boolean).join('');

    return `
      <div class="popup-content p-2 max-w-xs">
        <h3 class="text-lg font-bold">${name || 'Není název'}</h3>
        ${info || '<p>Žádné další informace</p>'}
      </div>
    `;
  };

  // Funkce pro zpracování kliknutí na vrstvu
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(createPopupContent(feature.properties));

      layer.on('click', () => {
        // Reset stylu předchozí vrstvy
        if (selectedLayer && selectedLayer !== layer) {
          if (selectedLayer.setStyle) {
            selectedLayer.setStyle(selectedLayer.options.defaultStyle);
          } else if (selectedLayer.setIcon) {
            selectedLayer.setIcon(new L.Icon.Default());
          }
        }

        // Zvýraznění aktuální vrstvy
        if (feature.geometry.type === 'Point') {
          layer.setIcon(selectedIcon);
        } else {
          layer.setStyle(selectedStyle);
        }

        setSelectedLayer(layer);
        layer.openPopup();
      });
    }
  };

  // Funkce pro nastavení výchozího stylu vrstvy
  const getDefaultStyle = (type) => {
    switch (type) {
      case 'district':
        return districtStyle;
      case 'garden':
        return gardenStyle;
      case 'playground':
        return playgroundStyle;
      default:
        return districtStyle;
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="alert alert-error m-4 max-w-2xl">
          <span>{error}</span>
        </div>
      )}
      <MapContainer
        center={[50.0755, 14.4378]}
        zoom={11}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {cityDistricts && (
          <GeoJSON
            data={cityDistricts}
            style={districtStyle}
            onEachFeature={(feature, layer) => {
              layer.options.defaultStyle = districtStyle;
              onEachFeature(feature, layer);
            }}
          />
        )}
        {gardens && (
          <GeoJSON
            data={gardens}
            style={gardenStyle}
            onEachFeature={(feature, layer) => {
              layer.options.defaultStyle = gardenStyle;
              onEachFeature(feature, layer);
            }}
          />
        )}
        {playgrounds && (
          <GeoJSON
            data={playgrounds}
            style={playgroundStyle}
            pointToLayer={(feature, latlng) => L.marker(latlng)}
            onEachFeature={(feature, layer) => {
              layer.options.defaultStyle = playgroundStyle;
              onEachFeature(feature, layer);
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default AppMap;