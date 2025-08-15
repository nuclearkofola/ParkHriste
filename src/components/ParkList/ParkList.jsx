import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { fetchGolemioData } from '../AppMap/api';
import './ParkList.css';

// Simple function to convert postal codes to Prague districts
const postalCodeToDistrict = (postalCode) => {
  if (!postalCode) return '';

  const code = parseInt(postalCode.toString().substring(0, 3));

  if (code >= 110 && code <= 119) return '1';
  if (code >= 120 && code <= 129) return '2';
  if (code >= 130 && code <= 139) return '3';
  if (code >= 140 && code <= 149) return '4';
  if (code >= 150 && code <= 159) return '5';
  if (code >= 160 && code <= 169) return '6';
  if (code >= 170 && code <= 179) return '7';
  if (code >= 180 && code <= 189) return '8';
  if (code >= 190 && code <= 199) return '9';
  if (code >= 100 && code <= 109) return '10';
  if (code >= 250 && code <= 259) return '11';
  if (code >= 260 && code <= 269) return '12';
  if (code >= 270 && code <= 279) return '13';
  if (code >= 280 && code <= 289) return '14';
  if (code >= 290 && code <= 299) return '15';
  if (code >= 210 && code <= 219) return '16';
  if (code >= 220 && code <= 229) return '17';
  if (code >= 230 && code <= 239) return '18';
  if (code >= 240 && code <= 249) return '19';
  if (code >= 200 && code <= 209) return '20';
  if (code >= 300 && code <= 309) return '21';
  if (code >= 310 && code <= 319) return '22';

  return '';
};

// Enhanced image handling function with HTTPS conversion
const getImageUrl = (item) => {
  let imageUrl = null;

  if (item.properties.image?.url) imageUrl = item.properties.image.url;
  else if (item.properties.images?.[0]?.url) imageUrl = item.properties.images[0].url;
  else if (item.properties.picture?.url) imageUrl = item.properties.picture.url;
  else if (item.properties.photo?.url) imageUrl = item.properties.photo.url;

  // Convert HTTP to HTTPS for security
  if (imageUrl && imageUrl.startsWith('http://')) {
    imageUrl = imageUrl.replace('http://', 'https://');
  }

  return imageUrl;
};

// Simple function to extract district from address
const extractDistrictFromAddress = (address) => {
  if (!address?.address_formatted) return '';

  const pragueMatch = address.address_formatted.match(/Praha\s*-?\s*(\d+)/i);
  if (pragueMatch && pragueMatch[1]) {
    return pragueMatch[1];
  }

  const districtMatch = address.address_formatted.match(/Praha-([^,]+)/i);
  if (districtMatch && districtMatch[1]) {
    const districtName = districtMatch[1].trim();

    const districtMap = {
      'Staré Město': '1', 'Nové Město': '1', 'Malá Strana': '1', 'Hradčany': '1',
      'Vinohrady': '2', 'Žižkov': '3', 'Nusle': '4', 'Smíchov': '5',
      'Dejvice': '6', 'Holešovice': '7', 'Karlín': '8', 'Libeň': '8',
      'Vršovice': '10', 'Kunratice': '4', 'Michle': '4', 'Podolí': '4',
      'Břevnov': '6', 'Troja': '7', 'Prosek': '9', 'Vysočany': '9'
    };

    return districtMap[districtName] || '';
  }

  return '';
};

// Enhanced function to get district
const getItemDistrict = (item) => {
  const address = item.properties?.address;
  if (!address) return '';

  if (address.postal_code) {
    const fromPostal = postalCodeToDistrict(address.postal_code);
    if (fromPostal) return fromPostal;
  }

  const extracted = extractDistrictFromAddress(address);
  if (extracted) return extracted;

  return '';
};

// Function to get district name for display
const getDistrictDisplayName = (item) => {
  const address = item.properties?.address;
  if (!address) return '';

  if (address.address_formatted) {
    const patterns = [
      /Praha-([^,]+)/i,
      /Hlavní město Praha-([^,]+)/i,
      /,\s*Praha\s*(\d+)/i
    ];

    for (const pattern of patterns) {
      const districtMatch = address.address_formatted.match(pattern);
      if (districtMatch && districtMatch[1]) {
        const districtName = districtMatch[1].trim();
        if (/^\d+$/.test(districtName)) {
          return `Praha ${districtName}`;
        }
        return districtName;
      }
    }
  }

  const districtNumber = getItemDistrict(item);
  return districtNumber ? `Praha ${districtNumber}` : '';
};

// Simple function to get clean address for display
const getDisplayAddress = (item) => {
  const address = item.properties?.address;
  if (!address) return 'Adresa není k dispozici';

  if (address.address_formatted) {
    return address.address_formatted
      .replace(', Česko', '')
      .replace(', Czech Republic', '')
      .replace('Hlavní město Praha-', '')
      .replace(/\d{5}\s+/, '');
  }

  const parts = [];
  if (address.street_address) parts.push(address.street_address);
  if (address.address_locality) {
    const locality = address.address_locality
      .replace('Hlavní město Praha', 'Praha')
      .replace('Praha-', '');
    parts.push(locality);
  }

  return parts.length > 0 ? parts.join(', ') : 'Adresa není k dispozici';
};

// Function to get all unique districts from API data
const getDistrictsFromAPI = (gardensData, playgroundsData) => {
  const districts = new Set();

  gardensData?.features?.forEach(item => {
    const district = getItemDistrict(item);
    if (district) districts.add(district);
  });

  playgroundsData?.features?.forEach(item => {
    const district = getItemDistrict(item);
    if (district) districts.add(district);
  });

  return Array.from(districts).sort((a, b) => parseInt(a) - parseInt(b));
};

// Distance calculation function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Main component
const ParkList = ({ viewMode = 'both' }) => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // States for filtering parks
  const [distanceFilterGardens, setDistanceFilterGardens] = useState(null);
  const [districtFilterGardens, setDistrictFilterGardens] = useState('');
  const [sortOrderGardens, setSortOrderGardens] = useState('name_asc');

  // States for filtering playgrounds
  const [distanceFilterPlaygrounds, setDistanceFilterPlaygrounds] = useState(null);
  const [districtFilterPlaygrounds, setDistrictFilterPlaygrounds] = useState('');
  const [sortOrderPlaygrounds, setSortOrderPlaygrounds] = useState('name_asc');

  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }

    const loadData = async () => {
      if (!apiKey) return setError("API klíč není nastaven");

      try {
        const gardensData = await fetchGolemioData("/v2/gardens", apiKey);
        const playgroundsData = await fetchGolemioData("/v2/playgrounds", apiKey);

        if (gardensData && gardensData.features) {
          gardensData.features.forEach(feature => {
            feature.properties.type = 'garden';
          });
        }

        if (playgroundsData && playgroundsData.features) {
          playgroundsData.features.forEach(feature => {
            feature.properties.type = 'playground';
          });
        }

        setGardens(gardensData);
        setPlaygrounds(playgroundsData);

        const districts = getDistrictsFromAPI(gardensData, playgroundsData);
        setAvailableDistricts(districts);

      } catch (error) {
        console.error('Error loading data:', error);
        setError("Chyba při načítání dat");
      }
    };

    loadData();
  }, [apiKey]);

  // Filtering functions
  const filterAndSortGardens = () => {
    if (!gardens?.features) return [];
    let filteredItems = [...gardens.features];

    if (districtFilterGardens) {
      filteredItems = filteredItems.filter(item => {
        const itemDistrict = getItemDistrict(item);
        return itemDistrict === districtFilterGardens;
      });
    }

    if (distanceFilterGardens && userLocation) {
      filteredItems = filteredItems.filter(item => {
        const coords = item.geometry?.coordinates;
        if (!coords) return false;
        const dist = getDistanceFromLatLonInKm(
          userLocation.lat, userLocation.lon, coords[1], coords[0]
        );
        return dist !== null && dist <= distanceFilterGardens;
      });
    }

    if (sortOrderGardens === 'name_asc') {
      filteredItems.sort((a, b) =>
        (a.properties.name || '').localeCompare(b.properties.name || '')
      );
    } else if (sortOrderGardens === 'name_desc') {
      filteredItems.sort((a, b) =>
        (b.properties.name || '').localeCompare(a.properties.name || '')
      );
    }

    return filteredItems;
  };

  const filterAndSortPlaygrounds = () => {
    if (!playgrounds?.features) return [];
    let filteredItems = [...playgrounds.features];

    if (districtFilterPlaygrounds) {
      filteredItems = filteredItems.filter(item => {
        const itemDistrict = getItemDistrict(item);
        return itemDistrict === districtFilterPlaygrounds;
      });
    }

    if (distanceFilterPlaygrounds && userLocation) {
      filteredItems = filteredItems.filter(item => {
        const coords = item.geometry?.coordinates;
        if (!coords) return false;
        const dist = getDistanceFromLatLonInKm(
          userLocation.lat, userLocation.lon, coords[1], coords[0]
        );
        return dist !== null && dist <= distanceFilterPlaygrounds;
      });
    }

    if (sortOrderPlaygrounds === 'name_asc') {
      filteredItems.sort((a, b) =>
        (a.properties.name || '').localeCompare(b.properties.name || '')
      );
    } else if (sortOrderPlaygrounds === 'name_desc') {
      filteredItems.sort((a, b) =>
        (b.properties.name || '').localeCompare(a.properties.name || '')
      );
    }

    return filteredItems;
  };

  const renderDistance = (feature) => {
    if (!userLocation) return null;
    const coords = feature.geometry?.coordinates;
    if (!coords) return null;
    const dist = getDistanceFromLatLonInKm(
      userLocation.lat, userLocation.lon, coords[1], coords[0]
    );
    return (
      <span className="btn btn-neutral btn-xs ml-2 cursor-default select-none">
        {dist ? dist.toFixed(1) : '?'} km
      </span>
    );
  };

  const filteredGardens = filterAndSortGardens();
  const filteredPlaygrounds = filterAndSortPlaygrounds();

  const showParks = viewMode === 'both' || viewMode === 'parks';
  const showPlaygrounds = viewMode === 'both' || viewMode === 'playgrounds';

  return (
    <div className="park-list-container">
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}

      {showParks && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold m-4 text-primary">Seznam parků</h2>

          <div className="filter-controls p-4 bg-base-200 rounded-lg mb-4 mx-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="select select-bordered w-full"
                value={distanceFilterGardens || ''}
                onChange={(e) => setDistanceFilterGardens(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Všechny vzdálenosti</option>
                <option value="1">Do 1 km</option>
                <option value="2">Do 2 km</option>
                <option value="5">Do 5 km</option>
                <option value="10">Do 10 km</option>
              </select>

              <select
                className="select select-bordered w-full"
                value={districtFilterGardens}
                onChange={(e) => setDistrictFilterGardens(e.target.value)}
              >
                <option value="">Všechny části ({availableDistricts.length})</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>Praha {district}</option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={sortOrderGardens}
                onChange={(e) => setSortOrderGardens(e.target.value)}
              >
                <option value="name_asc">Abecedně (A-Z)</option>
                <option value="name_desc">Abecedně (Z-A)</option>
              </select>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {filteredGardens.length > 0 ? filteredGardens.map((item, index) => (
              <li key={`garden-${index}`} className="border-b border-base-200 pb-2 mx-2">
                <Link
                  to={`/mapa?type=garden&id=${item.properties.id}`}
                  className="flex items-start gap-3 no-underline hover:bg-base-200 p-2 rounded-md transition-colors"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-base-200 rounded overflow-hidden">
                    {getImageUrl(item) ? (
                      <img
                        src={getImageUrl(item)}
                        alt={item.properties.name || 'Bez názvu'}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="fallback-icon flex items-center justify-center w-full h-full text-base-content/50 text-2xl"
                      style={{ display: getImageUrl(item) ? 'none' : 'flex' }}
                    >
                      <span>🌳</span>
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="text-base font-bold m-0 mr-1">
                        {item.properties.name || 'Bez názvu'}
                      </h3>
                      {renderDistance(item)}
                    </div>

                    <p className="text-sm text-base-content truncate">
                      {getDisplayAddress(item)}
                      {getDistrictDisplayName(item) && (
                        <span className="ml-1 text-primary">
                          ({getDistrictDisplayName(item)})
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {item.properties.content || item.properties.perex || 'Žádný popis není k dispozici'}
                    </p>
                  </div>
                </Link>
              </li>
            )) : <p className="ml-4">Žádné parky nenalezeny s vybranými filtry.</p>}
          </ul>
        </div>
      )}

      {showPlaygrounds && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold m-4 text-primary">Seznam hřišť</h2>

          <div className="filter-controls p-4 bg-base-200 rounded-lg mb-4 mx-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="select select-bordered w-full"
                value={distanceFilterPlaygrounds || ''}
                onChange={(e) => setDistanceFilterPlaygrounds(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Všechny vzdálenosti</option>
                <option value="1">Do 1 km</option>
                <option value="2">Do 2 km</option>
                <option value="5">Do 5 km</option>
                <option value="10">Do 10 km</option>
              </select>

              <select
                className="select select-bordered w-full"
                value={districtFilterPlaygrounds}
                onChange={(e) => setDistrictFilterPlaygrounds(e.target.value)}
              >
                <option value="">Všechny části ({availableDistricts.length})</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>Praha {district}</option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={sortOrderPlaygrounds}
                onChange={(e) => setSortOrderPlaygrounds(e.target.value)}
              >
                <option value="name_asc">Abecedně (A-Z)</option>
                <option value="name_desc">Abecedně (Z-A)</option>
              </select>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {filteredPlaygrounds.length > 0 ? filteredPlaygrounds.map((item, index) => (
              <li key={`playground-${index}`} className="border-b border-base-200 pb-2 mx-2">
                <Link
                  to={`/mapa?type=playground&id=${item.properties.id}`}
                  className="flex items-start gap-3 no-underline hover:bg-base-200 p-2 rounded-md transition-colors"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-base-200 rounded overflow-hidden">
                    {getImageUrl(item) ? (
                      <img
                        src={getImageUrl(item)}
                        alt={item.properties.name || 'Bez názvu'}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="fallback-icon flex items-center justify-center w-full h-full text-base-content/50 text-2xl"
                      style={{ display: getImageUrl(item) ? 'none' : 'flex' }}
                    >
                      <span>🛝</span>
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="text-base font-bold m-0 mr-1">
                        {item.properties.name || 'Bez názvu'}
                      </h3>
                      {renderDistance(item)}
                    </div>

                    <p className="text-sm text-base-content truncate">
                      {getDisplayAddress(item)}
                      {getDistrictDisplayName(item) && (
                        <span className="ml-1 text-primary">
                          ({getDistrictDisplayName(item)})
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {item.properties.content || item.properties.perex || 'Žádný popis není k dispozici'}
                    </p>
                  </div>
                </Link>
              </li>
            )) : <p className="ml-4">Žádná hřiště nenalezena s vybranými filtry.</p>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ParkList;