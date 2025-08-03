import AppMap from "../components/AppMap/AppMap";

export function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">Mapa hřišť</h1>
      <p className="text-lg mb-4">Prozkoumejte interaktivní mapu a najděte dětská hřiště a parky ve vašem okolí.</p>
      <AppMap className="w-full h-96 rounded shadow" />
    </div>
  );
}