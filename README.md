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
