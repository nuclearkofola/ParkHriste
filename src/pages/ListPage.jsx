import ParkList from "../components/ParkList/ParkList";

export function ListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card bg-base-100 shadow-xl rounded-box">
        <div className="card-body">
          <h2 className="card-title text-primary">Seznam parku a hřišt</h2>
          <p>Prozkoumej seznam a najdi co už znáš.</p>
          <ParkList className="w-full h-96" />
        </div>
      </div>
    </div>
  );
}