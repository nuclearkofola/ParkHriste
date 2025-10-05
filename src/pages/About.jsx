export function About() {
  return (



<div className="container mx-auto px-4 py-8">
  <div className="card bg-base-100 shadow-xl rounded-box">
    <div className="card-body">
      <h2 className="card-title text-primary">O nás</h2>
      <p>Jsme tým nadšenců, kteří chtějí usnadnit rodičům hledání kvalitních dětských hřišť a parků. Naším cílem je vytvořit komunitní platformu, kde si rodiny mohou vyměňovat tipy a zkušenosti.</p>
      <h3 className="text-xl font-semibold text-secondary">Naše mise</h3>
      <ul className="list-disc pl-5">
        <li>Zajištění přístupu k aktuálním informacím o hřištích.</li>
        <li>Podpora bezpečných a moderních dětských hřišť.</li>
        <li>Budování komunity pro rodiny s dětmi.</li>
      </ul>
      <p>Máte tip na nové hřiště? <a href="mailto:info@parkhriste.cz" className="link link-primary">Kontaktujte nás!</a></p>
    </div>
  </div>
</div>
  );
}