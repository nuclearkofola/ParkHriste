import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Outlet } from 'react-router-dom'; 
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-2">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
