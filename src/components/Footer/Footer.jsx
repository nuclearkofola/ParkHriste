export function Footer() {
  return (
    <footer className="flex flex-col md:flex-row items-center justify-between bg-neutral text-neutral-content p-10 gap-6">
      <aside className="flex flex-col items-center">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width="50" 
            height="50"
            className="fill-current"
          >
            <path d="M50,5.2c-21.2,0-38.3,17.2-38.3,38.3c0,16.8,10.8,31.1,25.9,36.2L50,94.8l12.4-15.1c15.1-5.2,25.9-19.4,25.9-36.2   C88.3,22.3,71.2,5.2,50,5.2z M69.4,60.2c-0.1,0-0.2,0-0.4,0c-0.6,0-1.1-0.4-1.3-1l-1.5-5.5h-6.9l1.3,4.7c0.2,0.7-0.2,1.5-0.9,1.7   c-0.1,0-0.2,0-0.4,0c-0.6,0-1.1-0.4-1.3-1l-3.6-12.8l-1.8,7.1c-0.1,1.1-1.4,6.7-13,6.7H30c-0.7,0-1.3-0.6-1.3-1.3s0.6-1.3,1.3-1.3   c5.3,0,7.9-1.2,9.1-2.3c1.1-1,1.3-1.9,1.3-2c0-0.1,0-0.2,0-0.3l7.5-29.2c0.2-0.7,0.9-1.2,1.6-1c0.7,0.2,1.2,0.9,1,1.6l-1,3.9h6.8   l1.2-4.5c0.2-0.7,0.9-1.1,1.5-1c0.7-0.1,1.4,0.3,1.5,1l9.7,34.8C70.5,59.2,70.1,60,69.4,60.2z" />
          </svg>
    <p>
      ParkHřiště
      <br />
      Váš průvodce dětskými hřišti v ČR
    </p>
      </aside>
      <nav className="flex flex-col items-center">
        
        <div className="grid grid-flow-col gap-4">
          <a className="link link-primary hover:text-accent" href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current">
              <path
                d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a className="link link-primary hover:text-accent" href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current">
              <path
                d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>
          <a className="link link-primary hover:text-accent" href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current">
              <path
                d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </a>
        </div>
      </nav>
      <div className="text-center">
        <p>&copy; {new Date().getFullYear()} Park Hřiště. Všechna práva vyhrazena. Věnováno Luďkovi a Aleně</p>
      </div>
    </footer>
  );
}