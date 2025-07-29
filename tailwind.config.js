// tailwind.config.js
module.exports = {
  content: [
    
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],  
    darkTheme: "light", 
    base: true,  
    styled: true,  
    utils: true,  
    logs: false,  
    themeRoot: ":root",  
  },
};