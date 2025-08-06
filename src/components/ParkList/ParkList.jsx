import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGolemioData } from '../AppMap/api'; 
import './ParkList.css';

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Radius of the earth in km
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

const ParkList = () => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
    // Získání polohy uživatele
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
    const loadData = async () => {
      if (!apiKey) return setError("API klíč není nastaven");
      const gardensData = await fetchGolemioData("/v2/gardens", apiKey);
      const playgroundsData = await fetchGolemioData("/v2/playgrounds", apiKey);
      setGardens(gardensData);
      setPlaygrounds(playgroundsData);
    };
    loadData();
  }, [apiKey]);

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

  return (
    <div className="park-list-container">
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}
      
      <h2 className="text-2xl font-bold m-4 text-primary">Seznam zahrad</h2>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {gardens?.features?.map((item, index) => (
          <li key={`garden-${index}`}>
            <div className="card bg-base-100 shadow-md border border-base-200">
              {item.properties.image?.url ? (
                <figure className="h-40 overflow-hidden">
                  <img
                    src={item.properties.image.url}
                    alt={item.properties.name || 'Bez názvu'}
                    className="object-cover w-full h-full"
                  />
                </figure>
              ) : (
                <figure className="h-40 flex items-center justify-center bg-base-200 text-base-content/50">
                  <span>Bez obrázku</span>
                </figure>
              )}
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-2">
                  <Link
                    to={`/mapa?type=garden&id=${item.properties.id}`}
                    className="flex items-center gap-2 no-underline hover:underline"
                  >
                    <h3 className="card-title text-lg font-bold m-0">
                      {item.properties.name || 'Bez názvu'}
                    </h3>
                    {renderDistance(item)}
                  </Link>
                </div>
                <p className="text-sm text-base-content mb-1">
                  {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
                </p>
              </div>
            </div>
          </li>
        )) || <p>Žádné zahrady nenalezeny.</p>}
      </ul>

      <h2 className="text-2xl font-bold m-4 text-primary">Seznam hřišť</h2>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {playgrounds?.features?.map((item, index) => (
          <li key={`playground-${index}`}>
            <div className="card bg-base-100 shadow-md border border-base-200">
              {item.properties.image?.url ? (
                <figure className="h-40 overflow-hidden">
                  <img
                    src={item.properties.image.url}
                    alt={item.properties.name || 'Bez názvu'}
                    className="object-cover w-full h-full"
                  />
                </figure>
              ) : (
                <figure className="h-40 flex items-center justify-center bg-base-200 text-base-content/50">
                  <span>Bez obrázku</span>
                </figure>
              )}
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-2">
                  <Link
                    to={`/mapa?type=playground&id=${item.properties.id}`}
                    className="flex items-center gap-2 no-underline hover:underline"
                  >
                    <h3 className="card-title text-lg font-bold m-0">
                      {item.properties.name || 'Bez názvu'}
                    </h3>
                    {renderDistance(item)}
                  </Link>
                </div>
                <p className="text-sm text-base-content mb-1">
                  {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
                </p>
              </div>
            </div>
          </li>
        )) || <p>Žádné hřiště nenalezeno.</p>}
      </ul>
    </div>
  );
};

export default ParkList;