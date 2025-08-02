export const fetchGolemioData = async (endpoint, apiKey) => {
  try {
    const res = await fetch(`https://api.golemio.cz${endpoint}`, {
      headers: { 'x-access-token': apiKey },
    });
    console.log(`[fetch] ${endpoint} →`, res.status); // ✅ přidáno

    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new Error(res.statusText);
    }

    const data = await res.json();
    console.log(`[data] ${endpoint} →`, data); // ✅ přidáno

    return data;
  } catch (e) {
    console.error(`Chyba při fetch z ${endpoint}:`, e);
    return null;
  }
};
