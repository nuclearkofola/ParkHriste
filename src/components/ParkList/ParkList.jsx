import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGolemioData } from '../AppMap/api'; 
import './ParkList.css';

const ParkList = () => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GOLEMIO_KEY;

  useEffect(() => {
    const loadData = async () => {
      if (!apiKey) return setError("API klíč není nastaven");

      const gardensData = await fetchGolemioData("/v2/gardens", apiKey);
      const playgroundsData = await fetchGolemioData("/v2/playgrounds", apiKey);

      setGardens(gardensData);
      setPlaygrounds(playgroundsData);
    };

    loadData();
  }, [apiKey]);

  return (
    <div className="park-list-container">
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}
      
      <h2 className="text-2xl font-bold m-4 text-primary">Seznam zahrad</h2>
      <ul className="park-list">
        {gardens?.features?.map((item, index) => (
          <li key={`garden-${index}`} className="park-item">
            <Link
              to={`/mapa?type=garden&id=${item.properties.id}`}
              className="link link-primary"
            >
              {item.properties.name || 'Bez názvu'} (Zahrada)
            </Link>
            <p className="text-sm text-base-content">
              {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
            </p>
          </li>
        )) || <p>Žádné zahrady nenalezeny.</p>}
      </ul>

      <h2 className="text-2xl font-bold m-4 text-primary">Seznam hřišť</h2>
      <ul className="park-list">
        {playgrounds?.features?.map((item, index) => (
          <li key={`playground-${index}`} className="park-item">
            <Link
              to={`/mapa?type=playground&id=${item.properties.id}`}
              className="link link-primary"
            >
              {item.properties.name || 'Bez názvu'} (Hřiště)
            </Link>
            <p className="text-sm text-base-content">
              {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
            </p>
          </li>
        )) || <p>Žádné hřiště nenalezeno.</p>}
      </ul>
    </div>
  );
};

export default ParkList;