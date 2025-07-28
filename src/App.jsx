import { useState } from 'react'
import './App.css'

import { Header } from "./components/Header/Header";
import AppMap from './components/AppMap/AppMap';
import { Footer } from "./components/Footer/Footer";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header />
      <h1>Park Hriste</h1>
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center p-4">Mapa Prahy</h1>
      <AppMap />
    </div>
    <Footer />
    </>
  )
}

export default App
