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
  iconSize: [30, 48],
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
        const districtsData = await fetchGolemioData('/v2/citydistricts', apiKey);
        console.log('Městské části:', districtsData);
        setCityDistricts(districtsData);

        const gardensData = await fetchGolemioData('/v2/gardens', apiKey);
        console.log('Zahrady:', gardensData);
        setGardens(gardensData);

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

  // Styl pro zvýrazněnou vrstvu
  const selectedStyle = {
    color: '#ff0000',
    weight: 4,
    opacity: 1,
  };

  // Funkce pro vytvoření popupu
  const createPopupContent = (feature) => {
    const properties = feature.properties;
    if (!properties) {
      return '<div class="p-4 bg-white rounded-lg shadow-md max-w-md"><h3 class="text-xl font-bold text-black">Není název</h3><p class="text-gray-600">Žádné informace</p></div>';
    }

    const { name, address, description, type, equipment, surface, district, url, updated_at, properties: extraProperties, id, image } = properties;
    const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates : null;

    // Zpracování adresy
    const addressString = address
      ? address.address_formatted
        ? address.address_formatted
        : `${address.street || ''}${address.street ? ', ' : ''}${address.city || ''} ${address.zip || ''}`.trim()
      : 'Adresa není k dispozici';

    // Zpracování vybavenosti (mapování na sekce podle hristepraha.cz)
    let facilities = '';
    let refreshments = '';
    let transport = '';
    if (extraProperties) {
      facilities = extraProperties
        .filter(prop => ['hriste', 'wc'].includes(prop.id))
        .map(prop => `<p><strong>${prop.description}:</strong> ${prop.value}</p>`)
        .join('');
      refreshments = extraProperties
        .filter(prop => prop.id === 'restaurace')
        .map(prop => `<p>${prop.value}</p>`)
        .join('');
      transport = extraProperties
        .filter(prop => ['mhd', 'parking'].includes(prop.id))
        .map(prop => `<p><strong>${prop.description}:</strong> ${prop.value}</p>`)
        .join('');
    }

    // Zpracování doporučení (použijeme např. 'misto' z extraProperties)
    const recommendations = extraProperties
      ? extraProperties
          .filter(prop => prop.id === 'misto')
          .map(prop => `<p>${prop.value}</p>`)
          .join('')
      : '';

    // Zpracování obrázku
    const imageString = image?.url
      ? `<img src="${image.url}" alt="${name || 'Obrázek místa'}" class="w-full h-48 object-cover rounded-md mb-4" />`
      : '';

    // Odkaz na navigaci (Mapy.cz)
    const navigationLink = coordinates
      ? `<p><a href="https://mapy.cz/zakladni?x=${coordinates[0]}&y=${coordinates[1]}&z=17" target="_blank" class="text-blue-600 underline hover:text-blue-800">Navigovat na Mapy.cz</a></p>`
      : '';

    // Struktura popupu podle hristepraha.cz
    const info = [
      imageString,
      name && `<h2 class="text-2xl font-bold text-black mb-3">${name}</h2>`,
      description && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Popis</h3>
        <p class="text-gray-600">${description}</p>`,
      recommendations && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Doporučujeme</h3>
        ${recommendations}`,
      facilities && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Sociální zařízení</h3>
        ${facilities}`,
      refreshments && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Občerstvení</h3>
        ${refreshments}`,
      transport && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Doprava</h3>
        ${transport}`,
      address && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Adresa</h3>
        <p class="text-gray-600">${addressString}</p>
        ${navigationLink}`,
      district && `<p class="text-gray-600 mt-2"><strong>Městská část:</strong> ${district}</p>`,
      id && `<p class="text-gray-600 mt-2"><strong>ID:</strong> ${id}</p>`,
      updated_at && `<p class="text-gray-600 mt-2"><strong>Poslední aktualizace:</strong> ${new Date(updated_at).toLocaleDateString('cs-CZ')}</p>`,
      url && `<p class="text-gray-600 mt-2"><strong>Web:</strong> <a href="${url}" target="_blank" class="text-blue-600 underline hover:text-blue-800">Více informací</a></p>`,
    ].filter(Boolean).join('');

    return `
      <div class="p-4 bg-white rounded-lg shadow-md max-w-md overflow-y-auto max-h-[80vh]">
        ${info || '<p class="text-gray-600">Žádné další informace</p>'}
      </div>
    `;
  };

  // Funkce pro zpracování kliknutí na vrstvu
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(createPopupContent(feature));

      layer.on('click', () => {
        if (selectedLayer && selectedLayer !== layer) {
          if (selectedLayer.setStyle) {
            selectedLayer.setStyle(selectedLayer.options.defaultStyle);
          } else if (selectedLayer.setIcon) {
            selectedLayer.setIcon(new L.Icon.Default());
          }
        }

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