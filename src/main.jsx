import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';


import { About } from './pages/About.jsx';
import { Home } from './pages/Home.jsx';
import { ListPage } from './pages/ListPage.jsx';
import { MapPage } from './pages/MapPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Home />} />
          <Route path='mapa' element={<MapPage />} />
          <Route path='seznam' element={<ListPage />} />
          <Route path='o-nas' element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
