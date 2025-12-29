// Netlify Function for global download counter using Upstash Redis REST
// Requires env vars: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

exports.handler = async function(event) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Upstash credentials not configured' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  const headers = {
    'Authorization': `Bearer ${UPSTASH_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    if (event.httpMethod === 'GET') {
      const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ cmd: ['GET', 'sayz:download_count'] })
      });
      const json = await res.json();
      let count = parseInt(json.result || '0', 10) || 0;
      return {
        statusCode: 200,
        body: JSON.stringify({ count }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    if (event.httpMethod === 'POST') {
      // increment
      const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ cmd: ['INCR', 'sayz:download_count'] })
      });
      const json = await res.json();
      const count = parseInt(json.result || '0', 10) || 0;
      return {
        statusCode: 200,
        body: JSON.stringify({ count }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }), headers: { 'Content-Type': 'application/json' } };
  }
};
