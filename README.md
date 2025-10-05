# parkhriste2
first react projekt

## Vývojové prostředí

1. Naklonujte repozitář
2. Zkopírujte `.env.example` jako `.env.local` a vyplňte vaše API klíče
3. Spusťte `npm install`
4. Spusťte `npm run dev`

## Nasazení na Netlify

1. Propojte repozitář s Netlify
2. V Netlify Site Settings → Environment variables přidejte:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY` 
   - `VITE_GOLEMIO_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`

Aplikace automaticky detekuje produkční prostředí a použije Netlify Functions jako proxy pro Golemio API kvůli CORS omezením.

## Deep link (SPA) routování

Pokud nešlo otevřít URL jako `https://<site>/mapa` přímo (404 na Netlify), ujisti se, že je přesměrování SPA aktivní:

1. V `netlify.toml` je nastavena sada redirectů:
   ```toml
   [[redirects]]
   from = "/api/golemio-proxy/*"
   to = "/.netlify/functions/golemio-proxy/:splat"
   status = 200

   [[redirects]]
   from = "/api/*"
   to = "/.netlify/functions/:splat"
   status = 200

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```
2. Příkaz `npm run build` a následný deploy na Netlify použije tato pravidla – žádný soubor `_redirects` není potřeba.

Při změně přesměrování vždy udělej nový deploy (ne pouze rebuild lokálně).
