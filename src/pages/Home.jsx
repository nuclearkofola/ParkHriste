export function Home() {
  return (
<div className="container mx-auto px-4 py-8">
  <div className="card bg-base-100 shadow-xl rounded-box">
    <div className="card-body">
      <h2 className="card-title text-primary">Vítejte na Park Hřiště</h2>
      <p>Objevte nejlepší dětská hřiště a parky ve vašem okolí! Naše platforma vám pomůže najít bezpečná a zábavná místa pro děti všech věkových kategorií.</p>
      <ul className="list-disc pl-5">
        <li>Interaktivní mapa s přehledem hřišť a parků.</li>
        <li>Podrobné informace o vybavení a dostupnosti.</li>
        <li>Tipy na rodinné výlety a aktivity.</li>
      </ul>
      <div className="card-actions justify-end">
        <a href="/seznam" className="btn btn-primary">Prozkoumat hřiště</a>
      </div>
    </div>
  </div>
</div>
  );
}