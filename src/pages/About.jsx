export function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">O nás</h1>
      <p className="text-lg mb-4">Jsme tým nadšenců, kteří chtějí usnadnit rodičům hledání kvalitních dětských hřišť a parků. Naším cílem je vytvořit komunitní platformu, kde si rodiny mohou vyměňovat tipy a zkušenosti.</p>
      <h2 className="text-xl font-semibold mb-2">Naše mise</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Zajištění přístupu k aktuálním informacím o hřištích.</li>
        <li>Podpora bezpečných a moderních dětských hřišť.</li>
        <li>Budování komunity pro rodiny s dětmi.</li>
      </ul>
      <p className="text-lg">Máte tip na nové hřiště? <a href="mailto:info@parkhriste.cz" className="underline hover:text-green-600">Kontaktujte nás!</a></p>
    </div>
  );
}