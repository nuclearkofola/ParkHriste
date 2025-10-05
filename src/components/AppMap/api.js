export const fetchGolemioData = async (endpoint, apiKey) => {
  try {
    // Detekce prostředí - production (Netlify) vs development (lokální)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    let res;
    
    if (isProduction) {
      // Na produkci použijeme Netlify Function jako proxy
      res = await fetch(`/.netlify/functions/golemio-proxy?path=${encodeURIComponent(endpoint)}`);
    } else {
      // Lokálně voláme Golemio API přímo
      res = await fetch(`https://api.golemio.cz${endpoint}`, {
        headers: { 'x-access-token': apiKey },
      });
    }
    
    console.log(`[fetch] ${endpoint} →`, res.status);

    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new Error(res.statusText);
    }

    const data = await res.json();
    console.log(`[data] ${endpoint} →`, data);

    return data;
  } catch (e) {
    console.error(`Chyba při fetch z ${endpoint}:`, e);
    return null;
  }
};
