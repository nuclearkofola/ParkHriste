import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-green-600 text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Park Hřiště</h1>
        <nav className="space-x-6">
          <Link to="/" className="hover:text-green-200 transition">Domů</Link>
          <Link to="mapa" className="hover:text-green-200 transition">Mapa</Link>
          <Link to="seznam" className="hover:text-green-200 transition">Hřiště</Link>
          <Link to="o-nas" className="hover:text-green-200 transition">O nás</Link>
        </nav>
      </div>
    </header>
  );
}