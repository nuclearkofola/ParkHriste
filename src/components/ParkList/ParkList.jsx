import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGolemioData } from '../AppMap/api';
import './ParkList.css';

// Enhanced helper function to clean and normalize district names
const cleanDistrictName = (district) => {
  if (!district) return '';
  
  // More comprehensive cleaning
  let cleaned = district
    .replace(/^Hlavní město Praha-?/i, '')
    .replace(/^Praha-?/i, '')
    .replace(/^Praha\s+/i, '')
    .replace(/^\d+\s*-\s*/, '') // Remove "1 - " prefix
    .trim();
    
  // Extract just the number/roman numeral if present
  const match = cleaned.match(/^(\d+|[IVX]+)/);
  if (match) {
    return match[1];
  }
  
  return cleaned;
};

// Simple function to convert postal codes to Prague districts - FIXED
const postalCodeToDistrict = (postalCode) => {
  if (!postalCode) return '';
  
  // Convert postal code to district number (first 3 digits determine district)
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
  
  // Additional districts
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

// Simple function to extract district number from address
const extractDistrictFromAddress = (address) => {
  if (!address?.address_formatted) return '';
  
  // Look for "Praha X" or "Praha-X" patterns
  const pragueMatch = address.address_formatted.match(/Praha\s*-?\s*(\d+)/i);
  if (pragueMatch && pragueMatch[1]) {
    return pragueMatch[1];
  }
  
  // Look for district names in address and extract the part after "Praha-"
  const districtMatch = address.address_formatted.match(/Praha-([^,]+)/i);
  if (districtMatch && districtMatch[1]) {
    const districtName = districtMatch[1].trim();
    
    // Map common district names to numbers (keep only the most common ones)
    const districtMap = {
      'Staré Město': '1',
      'Nové Město': '1', 
      'Malá Strana': '1',
      'Hradčany': '1',
      'Vinohrady': '2',
      'Žižkov': '3',
      'Nusle': '4',
      'Smíchov': '5',
      'Dejvice': '6',
      'Holešovice': '7',
      'Karlín': '8',
      'Libeň': '8',
      'Vršovice': '10',
      'Kunratice': '4',
      'Michle': '4',
      'Podolí': '4',
      'Břevnov': '6',
      'Troja': '7',
      'Prosek': '9',
      'Vysočany': '9',
      'Uhříněves': '22',
      'Benice': '21',
      'Újezd nad Lesy': '21'
    };
    
    return districtMap[districtName] || '';
  }
  
  return '';
};

// Simplified function to get district
const getItemDistrict = (item) => {
  const address = item.properties?.address;
  if (!address) return '';
  
  // Try postal code first (most reliable)
  if (address.postal_code) {
    const fromPostal = postalCodeToDistrict(address.postal_code);
    if (fromPostal) return fromPostal;
  }
  
  // Try extracting from formatted address
  const extracted = extractDistrictFromAddress(address);
  if (extracted) return extracted;
  
  return '';
};

// Debug the mapping in development
if (process.env.NODE_ENV === 'development') {
  console.log('=== POSTAL CODE MAPPING TEST ===');
  console.log('11000 →', postalCodeToDistrict('11000'));
  console.log('12000 →', postalCodeToDistrict('12000'));
  console.log('13000 →', postalCodeToDistrict('13000'));
  console.log('14000 →', postalCodeToDistrict('14000'));
  console.log('15000 →', postalCodeToDistrict('15000'));
  console.log('16000 →', postalCodeToDistrict('16000'));
  console.log('17000 →', postalCodeToDistrict('17000'));
}

// Simple function to get clean address for display
const getDisplayAddress = (item) => {
  const address = item.properties?.address;
  if (!address) return 'Adresa není k dispozici';
  
  // Use formatted address if available
  if (address.address_formatted) {
    // Clean up the formatted address - remove country and unnecessary parts
    return address.address_formatted
      .replace(', Česko', '')
      .replace(', Czech Republic', '')
      .replace('Hlavní město Praha-', '')
      .replace(/\d{5}\s+/, ''); // Remove postal code from middle
  }
  
  // Fallback: build simple address from parts
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

// Function to get district name for display
const getDistrictDisplayName = (item) => {
  const address = item.properties?.address;
  if (!address) return '';
  
  // Try to get district name from formatted address
  if (address.address_formatted) {
    const districtMatch = address.address_formatted.match(/Praha-([^,]+)/i);
    if (districtMatch && districtMatch[1]) {
      return districtMatch[1].trim();
    }
  }
  
  // Fallback to district number
  const districtNumber = getItemDistrict(item);
  return districtNumber ? `Praha ${districtNumber}` : '';
};

// Simplified function to get unique districts
const getDistrictsFromAPI = (gardensData, playgroundsData) => {
  const districts = new Set();
  
  // Extract districts from gardens
  gardensData?.features?.forEach(item => {
    const district = getItemDistrict(item);
    if (district) {
      districts.add(district);
    }
  });
  
  // Extract districts from playgrounds
  playgroundsData?.features?.forEach(item => {
    const district = getItemDistrict(item);
    if (district) {
      districts.add(district);
    }
  });
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('=== SIMPLIFIED DISTRICT EXTRACTION ===');
    console.log('Districts found:', Array.from(districts).sort((a, b) => parseInt(a) - parseInt(b)));
    
    // Test some examples
    if (playgroundsData?.features?.length > 0) {
      playgroundsData.features.slice(0, 3).forEach((item, i) => {
        console.log(`Example ${i + 1}:`, {
          name: item.properties.name,
          postal: item.properties.address?.postal_code,
          formatted: item.properties.address?.address_formatted,
          extracted_district: getItemDistrict(item),
          display_name: getDistrictDisplayName(item)
        });
      });
    }
  }
  
  return Array.from(districts).sort((a, b) => parseInt(a) - parseInt(b));
};

// Funkce pro výpočet vzdálenosti mezi dvěma body na Zemi (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Poloměr Země v km
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

// Hlavní komponenta pro výpis parků a hřišť
const ParkList = ({ viewMode = 'both' }) => {
  // ...existing state variables...
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Stavy pro filtrování parků
  const [distanceFilterGardens, setDistanceFilterGardens] = useState(null);
  const [districtFilterGardens, setDistrictFilterGardens] = useState('');
  const [sortOrderGardens, setSortOrderGardens] = useState('name_asc');
  const [propertyFilterGardens, setPropertyFilterGardens] = useState('');

  // Stavy pro filtrování hřišť
  const [distanceFilterPlaygrounds, setDistanceFilterPlaygrounds] = useState(null);
  const [districtFilterPlaygrounds, setDistrictFilterPlaygrounds] = useState('');
  const [sortOrderPlaygrounds, setSortOrderPlaygrounds] = useState('name_asc');
  const [propertyFilterPlaygrounds, setPropertyFilterPlaygrounds] = useState('');

  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
    // Get user location
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

        // Add type property to all features
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

        // Extract and set available districts with enhanced extraction
        const districts = getDistrictsFromAPI(gardensData, playgroundsData);
        setAvailableDistricts(districts);

        // Enhanced debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('=== API DATA ANALYSIS ===');
          console.log('Gardens count:', gardensData?.features?.length);
          console.log('Playgrounds count:', playgroundsData?.features?.length);
          
          // Sample address analysis
          if (gardensData?.features?.length > 0) {
            const sample = gardensData.features[0];
            console.log('Sample garden:', {
              name: sample.properties.name,
              address: sample.properties.address,
              extractedDistrict: getItemDistrict(sample)
            });
          }
          
          if (playgroundsData?.features?.length > 0) {
            const sample = playgroundsData.features[0];
            console.log('Sample playground:', {
              name: sample.properties.name,
              address: sample.properties.address,
              extractedDistrict: getItemDistrict(sample)
            });
          }
          
          console.log('Available districts:', districts);
        }

      } catch (error) {
        console.error('Error loading data:', error);
        setError("Chyba při načítání dat");
      }
    };

    loadData();
  }, [apiKey]);

  // Enhanced filtering function for gardens
  const filterAndSortGardens = () => {
    if (!gardens?.features) return [];

    let filteredItems = [...gardens.features];

    // Enhanced district filtering
    if (districtFilterGardens) {
      filteredItems = filteredItems.filter(item => {
        const itemDistrict = getItemDistrict(item);
        return itemDistrict === districtFilterGardens;
      });
    }

    // Distance filtering
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

    // Property filtering
    if (propertyFilterGardens) {
      filteredItems = filteredItems.filter(item => {
        return item.properties.properties?.some(prop =>
          prop.description === propertyFilterGardens
        );
      });
    }

    // Sorting
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

  // Enhanced filtering function for playgrounds
  const filterAndSortPlaygrounds = () => {
    if (!playgrounds?.features) return [];

    let filteredItems = [...playgrounds.features];

    // Enhanced district filtering
    if (districtFilterPlaygrounds) {
      filteredItems = filteredItems.filter(item => {
        const itemDistrict = getItemDistrict(item);
        return itemDistrict === districtFilterPlaygrounds;
      });
    }

    // Distance filtering
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

    // Property filtering
    if (propertyFilterPlaygrounds) {
      filteredItems = filteredItems.filter(item => {
        return item.properties.properties?.some(prop =>
          prop.description === propertyFilterPlaygrounds
        );
      });
    }

    // Sorting
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

  // Funkce pro získání unikátních vlastností
  const getUniqueProperties = (data) => {
    const properties = new Set();
    data?.features?.forEach(item => {
      item.properties.properties?.forEach(prop => {
        if (prop.description) properties.add(prop.description);
      });
    });
    return Array.from(properties).sort();
  };

  // Funkce pro vykreslení vzdálenosti od uživatele k danému místu
  const renderDistance = (feature) => {
    if (!userLocation) return null;
    const coords = feature.geometry?.coordinates;
    if (!coords) return null;
    const dist = getDistanceFromLatLonInKm(
      userLocation.lat,
      userLocation.lon,
      coords[1],
      coords[0]
    );
    return (
      <span className="btn btn-neutral btn-xs ml-2 cursor-default select-none">
        {dist ? dist.toFixed(1) : '?'} km
      </span>
    );
  };

  // Filtrované seznamy
  const filteredGardens = filterAndSortGardens();
  const filteredPlaygrounds = filterAndSortPlaygrounds();

  // Determine what to show based on viewMode
  const showParks = viewMode === 'both' || viewMode === 'parks';
  const showPlaygrounds = viewMode === 'both' || viewMode === 'playgrounds';

  return (
    <div className="park-list-container">
      {/* Error message */}
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}

      {/* Enhanced debug info - add more detail to see what's happening */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-base-200 p-4 m-2 text-xs">
          <h4 className="font-bold mb-2">Debug Information:</h4>
          <p><strong>Available districts:</strong> {availableDistricts.length > 0 ? availableDistricts.join(', ') : 'None found'}</p>
          <p><strong>Gardens loaded:</strong> {gardens?.features?.length || 0}</p>
          <p><strong>Playgrounds loaded:</strong> {playgrounds?.features?.length || 0}</p>
          <p><strong>Active garden filter:</strong> "{districtFilterGardens}"</p>
          <p><strong>Active playground filter:</strong> "{districtFilterPlaygrounds}"</p>
          <p><strong>Filtered gardens:</strong> {filteredGardens.length}</p>
          <p><strong>Filtered playgrounds:</strong> {filteredPlaygrounds.length}</p>
          
          {/* Show sample districts from actual data */}
          {gardens?.features?.slice(0, 3).map((item, i) => (
            <p key={i} className="text-xs">
              <strong>Garden {i+1}:</strong> {item.properties.name} → 
              District: "{item.properties.address?.district}" → 
              Extracted: "{getItemDistrict(item)}"
            </p>
          ))}
          {playgrounds?.features?.slice(0, 3).map((item, i) => (
            <p key={i} className="text-xs">
              <strong>Playground {i+1}:</strong> {item.properties.name} → 
              Postal: "{item.properties.address?.postal_code}" → 
              Extracted: "{getItemDistrict(item)}" → 
              Display: "{getDistrictDisplayName(item)}"
            </p>
          ))}
        </div>
      )}

      {/* Parks section */}
      {showParks && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold m-4 text-primary">Seznam parků</h2>

          {/* Enhanced district filter */}
          <div className="filter-controls p-4 bg-base-200 rounded-lg mb-4 mx-2">
            <h3 className="text-lg font-semibold mb-2">Filtrování a řazení parků</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Distance filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vzdálenost</span>
                </label>
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
              </div>

              {/* Enhanced district filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Městská část</span>
                </label>
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
              </div>

              {/* Sorting */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Řazení</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={sortOrderGardens}
                  onChange={(e) => setSortOrderGardens(e.target.value)}
                >
                  <option value="name_asc">Abecedně (A-Z)</option>
                  <option value="name_desc">Abecedně (Z-A)</option>
                </select>
              </div>

              {/* Property filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vybavení</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={propertyFilterGardens}
                  onChange={(e) => setPropertyFilterGardens(e.target.value)}
                >
                  <option value="">Všechna vybavení</option>
                  {getUniqueProperties(gardens).map(property => (
                    <option key={property} value={property}>{property}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parks list */}
          <ul className="flex flex-col gap-2">
            {filteredGardens.length > 0 ? filteredGardens.map((item, index) => (
              <li key={`garden-${index}`} className="border-b border-base-200 pb-2 mx-2">
                <Link
                  to={`/mapa?type=garden&id=${item.properties.id}`}
                  className="flex items-start gap-3 no-underline hover:bg-base-200 p-2 rounded-md transition-colors"
                >
                  {/* Small image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-base-200 rounded overflow-hidden">
                    {item.properties.image?.url ? (
                      <img
                        src={item.properties.image.url}
                        alt={item.properties.name || 'Bez názvu'}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-base-content/50 text-xs">
                        <span>Bez obrázku</span>
                      </div>
                    )}
                  </div>

                  {/* Text information */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="text-base font-bold m-0 mr-1">
                        {item.properties.name || 'Bez názvu'}
                      </h3>
                      {renderDistance(item)}
                    </div>
                    
                    {/* Simplified address display */}
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

      {/* Playgrounds section - similar structure */}
      {showPlaygrounds && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold m-4 text-primary">Seznam hřišť</h2>

          {/* Filters for playgrounds - similar to parks */}
          <div className="filter-controls p-4 bg-base-200 rounded-lg mb-4 mx-2">
            <h3 className="text-lg font-semibold mb-2">Filtrování a řazení hřišť</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Distance filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vzdálenost</span>
                </label>
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
              </div>

              {/* Enhanced district filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Městská část</span>
                </label>
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
              </div>

              {/* Sorting */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Řazení</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={sortOrderPlaygrounds}
                  onChange={(e) => setSortOrderPlaygrounds(e.target.value)}
                >
                  <option value="name_asc">Abecedně (A-Z)</option>
                  <option value="name_desc">Abecedně (Z-A)</option>
                </select>
              </div>

              {/* Property filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vybavení</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={propertyFilterPlaygrounds}
                  onChange={(e) => setPropertyFilterPlaygrounds(e.target.value)}
                >
                  <option value="">Všechna vybavení</option>
                  {getUniqueProperties(playgrounds).map(property => (
                    <option key={property} value={property}>{property}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Playgrounds list */}
          <ul className="flex flex-col gap-2">
            {filteredPlaygrounds.length > 0 ? filteredPlaygrounds.map((item, index) => (
              <li key={`playground-${index}`} className="border-b border-base-200 pb-2 mx-2">
                <Link
                  to={`/mapa?type=playground&id=${item.properties.id}`}
                  className="flex items-start gap-3 no-underline hover:bg-base-200 p-2 rounded-md transition-colors"
                >
                  {/* Small image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-base-200 rounded overflow-hidden">
                    {item.properties.image?.url ? (
                      <img
                        src={item.properties.image.url}
                        alt={item.properties.name || 'Bez názvu'}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-base-content/50 text-xs">
                        <span>Bez obrázku</span>
                      </div>
                    )}
                  </div>

                  {/* Text information */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="text-base font-bold m-0 mr-1">
                        {item.properties.name || 'Bez názvu'}
                      </h3>
                      {renderDistance(item)}
                    </div>
                    
                    {/* Simplified address display */}
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