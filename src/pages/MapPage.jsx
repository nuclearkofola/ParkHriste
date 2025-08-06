import { useSearchParams } from 'react-router-dom';
import AppMap from "../components/AppMap/AppMap";

export function MapPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-primary mb-2">Mapa hřišť</h1>
        <p className="text-lg">Prozkoumejte interaktivní mapu a najděte dětská hřiště a parky ve vašem okolí.</p>
      </div>
      
      
      <div className="w-full h-[80vh] min-h-[200px] min-w-[200px] rounded-lg shadow-lg overflow-hidden">
        <AppMap 
          className="w-full h-full"
          selectedItemType={type} 
          selectedItemId={id} 
        />
      </div>
    </div>
  );
}