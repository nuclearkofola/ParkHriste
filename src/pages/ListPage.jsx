export function ListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Seznam hřišť</h1>
      <p className="text-lg mb-4">Níže naleznete seznam dětských hřišť a parků v naší databázi. Vyberte si podle lokality nebo vybavení.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Hřiště Stromovka</h2>
          <p>Moderní hřiště s prolézačkami a skluzavkami, vhodné pro děti od 3 let.</p>
          <p><strong>Lokace:</strong> Praha 7</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Park Ladronka</h2>
          <p>Velké hřiště s pískovištěm a lanovkou, ideální pro rodiny.</p>
          <p><strong>Lokace:</strong> Praha 6</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Hřiště Letná</h2>
          <p>Bezpečné hřiště s měkkým povrchem, vhodné i pro nejmenší děti.</p>
          <p><strong>Lokace:</strong> Praha 7</p>
        </div>
      </div>
    </div>
  );
}