import { useState } from 'react'
import './App.css'
import AppMap from './AppMap';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Park Hriste</h1>
    <AppMap />
    </>
  )
}

export default App
