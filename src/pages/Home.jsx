export function Home() {
  return (
    <div className="container mx-auto px-4 py-8 bg-base-100 rounded-box shadow">
      <h1 className="text-3xl font-bold text-primary mb-4">Vítejte na Park Hřiště</h1>
      <p className="text-lg mb-4 text-base-content">Objevte nejlepší dětská hřiště a parky ve vašem okolí! Naše platforma vám pomůže najít bezpečná a zábavná místa pro děti všech věkových kategorií.</p>
      <ul className="list-disc list-inside mb-4 text-base-content">
        <li>Interaktivní mapa s přehledem hřišť a parků.</li>
        <li>Podrobné informace o vybavení a dostupnosti.</li>
        <li>Tipy na rodinné výlety a aktivity.</li>
      </ul>
      <a href="/seznam" className="btn btn-primary">Prozkoumat hřiště</a>
    </div>
  );
}