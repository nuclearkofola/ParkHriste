import { Link } from "react-router-dom";

export function Home() {
  return (<>
  <div
  className="hero min-h-screen"
  style={{
    backgroundImage:
      "url(https://upload.wikimedia.org/wikipedia/commons/3/3e/Male%C5%A1ick%C3%BD_park_Praha_10_bezbari%C3%A9rov%C3%A9_h%C5%99i%C5%A1t%C4%9B_01.JPG)",
  }}
>
  <div className="hero-overlay"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-sm">
      <h1 className="mb-5 text-6xl font-bold">Vítejte na Park Hřiště</h1>
      <p className="mb-6 ">
       Objevte nejlepší dětská hřiště a parky ve vašem okolí! Naše platforma vám pomůže najít bezpečná a zábavná místa pro děti všech věkových kategorií.
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/mapa" className="btn btn-primary btn-outline">Mapa</Link>
        <Link to="/seznam" className="btn btn-success btn-outline">Seznam</Link>
      </div>
    </div>
  </div>
</div>
    

</>
  );
}