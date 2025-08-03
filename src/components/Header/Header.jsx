import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

export function Header() {
  return (
    <header className="shadow-md sticky top-0 z-50 bg-base-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-primary">Park Hřiště</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="btn btn-ghost btn-sm text-base-content">Domů</Link>
          <Link to="/mapa" className="btn btn-ghost btn-sm text-base-content">Mapa</Link>
          <Link to="/seznam" className="btn btn-ghost btn-sm text-base-content">Hřiště</Link>
          <Link to="/o-nas" className="btn btn-ghost btn-sm text-base-content">O nás</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

