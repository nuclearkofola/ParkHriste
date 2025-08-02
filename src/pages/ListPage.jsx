import ParkList from "../components/ParkList/ParkList";

export function ListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Seznam parku a hřišt</h1>
      <p className="text-lg mb-4">Prozkoumej seznam a najdi co už znáš.</p>
      <ParkList className="w-full h-96 rounded shadow" />
    </div>
  );
}