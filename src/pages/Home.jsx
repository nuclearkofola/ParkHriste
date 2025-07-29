export function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Vítejte na Park Hřiště</h1>
      <p className="text-lg mb-4">Objevte nejlepší dětská hřiště a parky ve vašem okolí! Naše platforma vám pomůže najít bezpečná a zábavná místa pro děti všech věkových kategorií.</p>
      <ul className="list-disc list-inside mb-4">
        <li>Interaktivní mapa s přehledem hřišť a parků.</li>
        <li>Podrobné informace o vybavení a dostupnosti.</li>
        <li>Tipy na rodinné výlety a aktivity.</li>
      </ul>
      <a href="/seznam" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Prozkoumat hřiště</a>
    </div>
  );
}