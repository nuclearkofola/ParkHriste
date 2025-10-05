import { useState } from 'react';
import ParkList from "../components/ParkList/ParkList";

export function ListPage() {
  const [viewMode, setViewMode] = useState('both'); // 'parks', 'playgrounds', 'both'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl rounded-box">
        <div className="card-body">
          <h2 className="card-title text-primary">Seznam parků a hřišť</h2>
          <p>Prozkoumej seznam a najdi co už znáš.</p>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-2 my-4">
            <button
              className={`btn ${viewMode === 'both' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('both')}
            >
              Zobrazit vše
            </button>
            <button
              className={`btn ${viewMode === 'parks' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('parks')}
            >
              Pouze parky
            </button>
            <button
              className={`btn ${viewMode === 'playgrounds' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('playgrounds')}
            >
              Pouze hřiště
            </button>
          </div>

          <ParkList className="w-full h-96" viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
}