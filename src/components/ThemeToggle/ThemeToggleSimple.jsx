export const ThemeToggleSimple = () => {
  return (
    <button
      data-toggle-theme="park,darkpark"
      data-act-class="ACTIVECLASS"
      className="btn btn-ghost btn-circle"
      aria-label="Přepnout téma"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
          clipRule="evenodd" 
        />
      </svg>
    </button>
  );
};
