import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGolemioData } from '../AppMap/api';
import './ParkList.css';

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
const ParkList = () => {
  // Stav pro data zahrad, hřišť, chybovou hlášku a polohu uživatele
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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

  // Načtení API klíče z prostředí
  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  // useEffect pro načtení dat a zjištění polohy uživatele při načtení komponenty
  useEffect(() => {
    // Získání polohy uživatele pomocí Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
    // Asynchronní načtení dat ze dvou endpointů
    const loadData = async () => {
      if (!apiKey) return setError("API klíč není nastaven");
      const gardensData = await fetchGolemioData("/v2/gardens", apiKey);
      const playgroundsData = await fetchGolemioData("/v2/playgrounds", apiKey);
      setGardens(gardensData);
      setPlaygrounds(playgroundsData);
    };
    loadData();
  }, [apiKey]);

  // Funkce pro získání unikátních městských částí
  const getUniqueDistricts = (data) => {
    const districts = new Set();
    data?.features?.forEach(item => {
      const district = item.properties.address?.district;
      if (district) districts.add(district);
    });
    return Array.from(districts).sort();
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

  // Filtrování a řazení dat
  const filterAndSortGardens = () => {
    if (!gardens?.features) return [];

    let filteredItems = [...gardens.features];

    // Filtr podle vzdálenosti
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

    // Filtr podle městské části
    if (districtFilterGardens) {
      filteredItems = filteredItems.filter(item =>
        item.properties.address?.district === districtFilterGardens
      );
    }

    // Filtr podle vlastností
    if (propertyFilterGardens) {
      filteredItems = filteredItems.filter(item => {
        return item.properties.properties?.some(prop =>
          prop.description === propertyFilterGardens
        );
      });
    }

    // Řazení podle názvu
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

  // Filtrování a řazení dat pro hřiště
  const filterAndSortPlaygrounds = () => {
    if (!playgrounds?.features) return [];

    let filteredItems = [...playgrounds.features];

    // Filtr podle vzdálenosti
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

    // Filtr podle městské části
    if (districtFilterPlaygrounds) {
      filteredItems = filteredItems.filter(item =>
        item.properties.address?.district === districtFilterPlaygrounds
      );
    }

    // Filtr podle vlastností
    if (propertyFilterPlaygrounds) {
      filteredItems = filteredItems.filter(item => {
        return item.properties.properties?.some(prop =>
          prop.description === propertyFilterPlaygrounds
        );
      });
    }

    // Řazení podle názvu
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

  // Funkce pro vykreslení vzdálenosti od uživatele k danému místu
  const renderDistance = (feature) => {
    if (!userLocation) return null;
    const coords = feature.geometry?.coordinates;
    if (!coords) return null;
    // GeoJSON: [lon, lat]
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

  // Vykreslení komponenty
  return (
    <div className="park-list-container">
      {/* Chybová hláška */}
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}

      {/* Sekce parků */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold m-4 text-primary">Seznam parků</h2>

        {/* Filtry pro parky */}
        <div className="filter-controls p-4 bg-base-200 rounded-lg mb-4 mx-2">
          <h3 className="text-lg font-semibold mb-2">Filtrování a řazení parků</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtr vzdálenosti */}
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

            {/* Filtr městské části */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Městská část</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={districtFilterGardens}
                onChange={(e) => setDistrictFilterGardens(e.target.value)}
              >
                <option value="">Všechny části</option>
                {getUniqueDistricts(gardens).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Řazení */}
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

            {/* Filtr vlastností */}
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

        {/* Seznam parků */}
        <ul className="flex flex-col gap-2">
          {filteredGardens.length > 0 ? filteredGardens.map((item, index) => (
            <li key={`garden-${index}`} className="border-b border-base-200 pb-2 mx-2">
              <Link
                to={`/mapa?type=garden&id=${item.properties.id}`}
                className="flex items-start gap-3 no-underline hover:bg-base-200 p-2 rounded-md transition-colors"
              >
                {/* Malý obrázek */}
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

                {/* Textové informace */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    <h3 className="text-base font-bold m-0 mr-1">
                      {item.properties.name || 'Bez názvu'}
                    </h3>
                    {renderDistance(item)}
                  </div>
                  <p className="text-sm text-base-content truncate">
                    {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
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

      {/* Sekce hřišť */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold m-4 text-primary">Seznam hřišť</h2>

        {/* Filtry pro hřiště */}
        <div className="filter-controls p-4 bg-base-200 rounded-lg mb-4 mx-2">
          <h3 className="text-lg font-semibold mb-2">Filtrování a řazení hřišť</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtr vzdálenosti */}
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

            {/* Filtr městské části */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Městská část</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={districtFilterPlaygrounds}
                onChange={(e) => setDistrictFilterPlaygrounds(e.target.value)}
              >
                <option value="">Všechny části</option>
                {getUniqueDistricts(playgrounds).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Řazení */}
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

            {/* Filtr vlastností */}
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

        {/* Seznam hřišť */}
        <ul className="flex flex-col gap-2">
          {filteredPlaygrounds.length > 0 ? filteredPlaygrounds.map((item, index) => (
            <li key={`playground-${index}`} className="border-b border-base-200 pb-2 mx-2">
              <Link
                to={`/mapa?type=playground&id=${item.properties.id}`}
                className="flex items-start gap-3 no-underline hover:bg-base-200 p-2 rounded-md transition-colors"
              >
                {/* Malý obrázek */}
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

                {/* Textové informace */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    <h3 className="text-base font-bold m-0 mr-1">
                      {item.properties.name || 'Bez názvu'}
                    </h3>
                    {renderDistance(item)}
                  </div>
                  <p className="text-sm text-base-content truncate">
                    {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
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
    </div>
  );
};

export default ParkList;