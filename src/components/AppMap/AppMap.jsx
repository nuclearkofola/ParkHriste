import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import './AppMap.css';
import L from 'leaflet';

// Oprava pro ikony Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ikona pro hřiště
const selectedIcon = L.divIcon({
  html: `
    <div class="custom-icon playground-icon">
      <span>☢️</span>
    </div>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});

// Ikona pro parky
const gardenIcon = L.divIcon({
  html: `
    <div class="custom-icon garden-icon">
      <span>🚩</span>
    </div>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: '',
});

// Funkce pro načtení dat z Golemio API
const fetchGolemioData = async (endpoint, apiKey) => {
  try {
    const response = await fetch(`https://api.golemio.cz${endpoint}`, {
      headers: {
        'x-access-token': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chyba při načítání dat z ${endpoint}: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      throw new Error(`Odpověď z ${endpoint} není JSON`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Chyba při fetch z ${endpoint}:`, error);
    return null;
  }
};

// Hlavní komponenta AppMap
const AppMap = () => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!apiKey) {
          throw new Error('API klíč není nastaven');
        }

        const gardensData = await fetchGolemioData('/v2/gardens', apiKey);
        if (gardensData && gardensData.type === 'FeatureCollection' && Array.isArray(gardensData.features)) {
          setGardens(gardensData);
        } else {
          setGardens(null);
        }

        const playgroundsData = await fetchGolemioData('/v2/playgrounds', apiKey);
        setPlaygrounds(playgroundsData);
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
    return () => {
      setGardens(null);
      setPlaygrounds(null);
      setError(null);
    };
  }, [apiKey]);

  // Styly pro GeoJSON vrstvy
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
    fillOpacity: 0.5,
  };

  // Mapování ID vlastností z playgrounds na klíče
  const propertyIdMap = {
    1: 'hriste', // Plocha pro míčové hry
    2: 'hriste', // In line stezky, skate parky, BMX areály, dopravní hřiště
    3: 'sport', // Jiné sporty (lanová centra, minigolf, discgolf, boby)
    4: 'sport', // Fitness prvky
    5: 'voda', // Voda-hydrant nebo umyvadlo
    6: 'wc', // WC na hřišti nebo v bezprostřední blízkosti
    7: 'spravce', // Správce na hřišti
    8: 'stin', // Částečný stín
    9: 'kultura', // Kultura (muzea, galerie, venkovní sochy, divadla, planetária)
    10: 'naucne', // Naučné stezky
    11: 'zoo', // ZOO koutky
    12: 'restaurace', // Restaurace nebo kavárny v bezprostřední blízkosti
    13: 'voda', // Bazény, vodní atrakce, vodní soustavy
  };

  // Funkce pro vytvoření popupu
  const createPopupContent = (feature) => {
    const properties = feature.properties || {};
    if (!properties) {
      return '<div class="p-4 bg-white rounded-lg shadow-md max-w-md"><h3 class="text-xl font-bold text-black">Není název</h3><p class="text-gray-600">Žádné informace</p></div>';
    }

    const { name = 'Není název', address = {}, description = '', content = '', perex = '', type = '', equipment = '', surface = '', district = '', url = '', updated_at = '', properties: extraProperties = [], image = {} } = properties;
    const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates : null;

    // Zpracování adresy
    const addressString = address.address_formatted
      ? address.address_formatted
      : [
          address.street_address || address.street || '',
          address.address_locality || address.city || '',
          address.postal_code || address.zip || '',
        ].filter(Boolean).join(', ').trim() || 'Adresa není k dispozici';

    // Zpracování vybavenosti a dalších vlastností
    let facilities = '';
    let refreshments = '';
    let transport = '';
    let otherProperties = '';
    let recommendations = '';
    if (Array.isArray(extraProperties) && extraProperties.length > 0) {
      facilities = extraProperties
        .filter(prop => prop?.id && ['hriste', 'wc', 'voda', 'zoo', 'stin', 'vek', 'spravce', 'kultura'].includes(propertyIdMap[prop.id]))
        .map(prop => `<p><strong>${prop.description || 'Není popis'}:</strong> ${prop.value && prop.value.trim() ? prop.value : 'Ne'}</p>`)
        .join('');
      refreshments = extraProperties
        .filter(prop => prop?.id === 12)
        .map(prop => `<p><strong>Občerstvení:</strong> ${prop.value && prop.value.trim() ? prop.value : 'Ne'}</p>`)
        .join('');
      transport = extraProperties
        .filter(prop => prop?.id && ['mhd', 'parking'].includes(prop.id))
        .map(prop => `<p><strong>${prop.description || 'Není popis'}:</strong> ${prop.value && prop.value.trim() ? prop.value : 'Ne'}</p>`)
        .join('');
      otherProperties = extraProperties
        .filter(prop => prop?.id && !['hriste', 'wc', 'voda', 'zoo', 'stin', 'vek', 'spravce', 'kultura', 'restaurace', 'mhd', 'parking', 'misto', 'brusle', 'cesty', 'doba', 'kolo', 'provoz', 'sport', 'naucne'].includes(prop.id) && prop.value && prop.value.trim())
        .map(prop => `<p><strong>${prop.description || 'Není popis'}:</strong> ${prop.value}</p>`)
        .join('');
      recommendations = extraProperties
        .filter(prop => prop?.id === 10 && prop.description === 'Naučné stezky')
        .map(prop => `<p>${prop.value || 'Není popis'}</p>`)
        .join('');
    }

    // Zpracování obrázku
    const imageString = image.url
      ? `<img src="${image.url}" alt="${name || 'Obrázek místa'}" class="w-full h-48 object-cover rounded-md mb-4" />`
      : '';

    // Odkaz na navigaci
    const navigationLink = coordinates
      ? `<p><a href="https://mapy.cz/zakladni?x=${coordinates[0]}&y=${coordinates[1]}&z=17" target="_blank" class="text-blue-600 underline hover:text-blue-800">Navigovat na Mapy.cz</a></p>`
      : '';

    // Podrobnosti pro hřiště a parky
    const details = (type === 'playground' || type === 'garden' || !type) && (perex || content || equipment || surface || facilities)
      ? `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">${type === 'playground' || !type ? 'Podrobnosti o hřišti' : 'Sociální zařízení'}</h3>
        ${perex ? `<p><strong>Krátký popis:</strong> ${perex}</p>` : ''}
        ${content ? `<p><strong>Podrobný popis:</strong> ${content}</p>` : ''}
        ${equipment ? `<p><strong>Vybavení:</strong> ${equipment}</p>` : ''}
        ${surface ? `<p><strong>Povrch:</strong> ${surface}</p>` : ''}
        ${facilities ? `${facilities}` : ''}
      `
      : facilities;

    // Struktura popupu
    const info = [
      imageString,
      name && `<h2 class="text-2xl font-bold text-black mb-3">${name}</h2>`,
      description && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Popis</h3>
        <p class="text-gray-600">${description}</p>`,
      recommendations && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Doporučujeme</h3>
        ${recommendations}`,
      details && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">${type === 'playground' || !type ? 'Podrobnosti o hřišti' : 'Sociální zařízení'}</h3>
        ${details}`,
      refreshments && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Občerstvení</h3>
        ${refreshments}`,
      transport && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Doprava</h3>
        ${transport}`,
      otherProperties && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Další informace</h3>
        ${otherProperties}`,
      addressString !== 'Adresa není k dispozici' && `
        <h3 class="text-lg font-semibold text-black mt-4 mb-2">Adresa</h3>
        <p class="text-gray-600">${addressString}</p>
        ${navigationLink}`,
      district && `<p class="text-gray-600 mt-2"><strong>Městská část:</strong> ${district}</p>`,
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
            selectedLayer.setStyle(selectedLayer.options.defaultStyle || playgroundStyle);
          } else if (selectedLayer.setIcon) {
            selectedLayer.setIcon(feature.properties.type === 'garden' ? gardenIcon : selectedIcon);
          }
        }

        if (feature.geometry.type === 'Point') {
          layer.setIcon(feature.properties.type === 'garden' ? gardenIcon : selectedIcon);
        } else {
          layer.setStyle(selectedStyle);
        }

        setSelectedLayer(layer);
        layer.openPopup();
      });
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
        {gardens && (
          <GeoJSON
            data={gardens}
            pointToLayer={(feature, latlng) => L.marker(latlng, { icon: gardenIcon })}
            onEachFeature={(feature, layer) => {
              feature.properties.type = 'garden'; // Přidání typu pro parky
              onEachFeature(feature, layer);
            }}
          />
        )}
        {playgrounds && (
          <GeoJSON
            data={playgrounds}
            style={playgroundStyle}
            pointToLayer={(feature, latlng) => L.marker(latlng, { icon: selectedIcon })}
            onEachFeature={(feature, layer) => {
              feature.properties.type = 'playground'; // Přidání typu pro hřiště
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