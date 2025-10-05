exports.handler = async (event, context) => {
  // Kontrola HTTP metody
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Získání API klíče z environment variables
    const apiKey = process.env.VITE_GOLEMIO_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API klíč není nastaven' }),
      };
    }

    // Získání cesty z query parametrů
    const { path } = event.queryStringParameters || {};
    
    if (!path) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Chybí parametr path' }),
      };
    }

    // Sestavení URL pro Golemio API
    const golemioUrl = `https://api.golemio.cz${path}`;
    
    // Volání Golemio API
    const response = await fetch(golemioUrl, {
      headers: {
        'X-Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Golemio API error: ${response.statusText}` }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
