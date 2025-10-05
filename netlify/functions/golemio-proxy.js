// Netlify Function to proxy requests to Golemio API while injecting the secret token
// Supports two usage patterns:
// 1) Query param style: /api/golemio-proxy?path=/v2/some/endpoint
// 2) Path segment style (preferred): /api/golemio-proxy/v2/some/endpoint
// Also handles CORS preflight (OPTIONS) requests.

const buildCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
});

// Support both ESM (export) and CommonJS (module.exports) when Netlify bundles functions.
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: buildCorsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: buildCorsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const apiKey = process.env.VITE_GOLEMIO_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: buildCorsHeaders(), body: JSON.stringify({ error: 'API klíč není nastaven' }) };
    }

    // Determine endpoint path
    let endpointPath = null;

    // Preferred: capture after function name using path (e.g. /.netlify/functions/golemio-proxy/v2/places)
    // event.path includes '/.netlify/functions/golemio-proxy...' in production; in redirect form '/api/golemio-proxy/...'
    const pathMatch = event.path.match(/golemio-proxy(?:\/)?(.*)/);
    if (pathMatch && pathMatch[1]) {
      endpointPath = '/' + pathMatch[1];
    }

    // Fallback: query string param ?path=/v2/...
    if (!endpointPath) {
      endpointPath = (event.queryStringParameters && event.queryStringParameters.path) || null;
    }

    if (!endpointPath || endpointPath === '/') {
      return { statusCode: 400, headers: buildCorsHeaders(), body: JSON.stringify({ error: 'Chybí endpoint path' }) };
    }

    // Prevent double leading slashes
    endpointPath = endpointPath.startsWith('/') ? endpointPath : '/' + endpointPath;

    // Preserve original query string parameters (excluding the internal 'path' param if present)
    const originalQs = event.rawQuery || '';
    let queryToAppend = '';
    if (originalQs) {
      const params = new URLSearchParams(originalQs);
      // Remove our own path param to avoid confusing upstream
      params.delete('path');
      const serialized = params.toString();
      if (serialized) queryToAppend = `?${serialized}`;
    }

    const url = `https://api.golemio.cz${endpointPath}${queryToAppend}`;

    const upstream = await fetch(url, {
      headers: {
        'X-Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const headers = { ...buildCorsHeaders(), 'Content-Type': contentType };

    if (!upstream.ok) {
      const text = await upstream.text();
      return { statusCode: upstream.status, headers, body: JSON.stringify({ error: 'Golemio API error', statusText: upstream.statusText, upstream: text.slice(0, 500) }) };
    }

    // Stream JSON (or other) response
    const body = await upstream.text();
    return { statusCode: 200, headers, body };
  } catch (error) {
    return { statusCode: 500, headers: buildCorsHeaders(), body: JSON.stringify({ error: error.message }) };
  }
};

// CommonJS compatibility (in case Netlify runtime expects it)
try {
  if (typeof module !== 'undefined') {
    module.exports = { handler };
  }
} catch (_) {}
