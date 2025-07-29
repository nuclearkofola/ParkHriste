import { useState } from 'react';
import './App.css';

import { Header } from './components/Header/Header';
import AppMap from './components/AppMap/AppMap';
import { Footer } from './components/Footer/Footer';

import { Outlet } from 'react-router-dom'; // <- přidáno

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />

      <Outlet />

      <Footer />
    </>
  );
}

export default App;
