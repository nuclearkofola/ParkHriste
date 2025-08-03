export function About() {
  return (
    <div className="container mx-auto px-4 py-8 bg-base-100 rounded-box shadow">
      <h1 className="text-3xl font-bold text-primary mb-4">O nás</h1>
      <p className="text-lg mb-4 text-base-content">Jsme tým nadšenců, kteří chtějí usnadnit rodičům hledání kvalitních dětských hřišť a parků. Naším cílem je vytvořit komunitní platformu, kde si rodiny mohou vyměňovat tipy a zkušenosti.</p>
      <h2 className="text-xl font-semibold mb-2 text-secondary">Naše mise</h2>
      <ul className="list-disc list-inside mb-4 text-base-content">
        <li>Zajištění přístupu k aktuálním informacím o hřištích.</li>
        <li>Podpora bezpečných a moderních dětských hřišť.</li>
        <li>Budování komunity pro rodiny s dětmi.</li>
      </ul>
      <p className="text-lg text-base-content">Máte tip na nové hřiště?{' '}
        <a href="mailto:info@parkhriste.cz" className="link link-primary">Kontaktujte nás!</a>
      </p>
    </div>
  );
}