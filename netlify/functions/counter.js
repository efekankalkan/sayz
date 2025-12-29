// Netlify Function for global download counter.
// Supports two backends (in order of preference):
// 1) Neon (Postgres) via Netlify's Neon integration using env `NETLIFY_DATABASE_URL` (or UNPOOLED variant)
// 2) Upstash Redis REST via UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
//
// Optional protection: set NETLIFY_COUNTER_SECRET in Netlify envs and include header
// `x-counter-secret: <secret>` on POST requests to prevent public abuse.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const COUNTER_SECRET = process.env.NETLIFY_COUNTER_SECRET || null;

async function upstashGetCount(){
  const headers = { 'Authorization': `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' };
  const res = await fetch(UPSTASH_URL, { method: 'POST', headers, body: JSON.stringify({ cmd: ['GET', 'sayz:download_count'] }) });
  const json = await res.json();
  return parseInt(json.result || '0', 10) || 0;
}

async function upstashIncrement(){
  const headers = { 'Authorization': `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' };
  const res = await fetch(UPSTASH_URL, { method: 'POST', headers, body: JSON.stringify({ cmd: ['INCR', 'sayz:download_count'] }) });
  const json = await res.json();
  return parseInt(json.result || '0', 10) || 0;
}

exports.handler = async function(event) {
  // Try Neon/Postgres first if configured
  const NEON_URL = process.env.NETLIFY_DATABASE_URL || process.env.NETLIFY_DATABASE_URL_UNPOOLED || null;

  // Helper to validate secret for POSTs
  function validateSecret(headers){
    if (!COUNTER_SECRET) return true;
    const provided = (headers && (headers['x-counter-secret'] || headers['X-Counter-Secret'])) || null;
    return provided === COUNTER_SECRET;
  }

  try {
    if (NEON_URL) {
      // dynamic import to avoid hard dependency when not used
      const mod = await import('@netlify/neon');
      const neon = mod.neon || mod.default && mod.default.neon;
      if (!neon) throw new Error('Neon client not available');
      const sql = neon();

      if (event.httpMethod === 'GET') {
        // Ensure table exists (safe to run each time)
        await sql`CREATE TABLE IF NOT EXISTS sayz_counters (key TEXT PRIMARY KEY, count BIGINT DEFAULT 0)`;
        const rows = await sql`SELECT count FROM sayz_counters WHERE key = 'downloads'`;
        const count = (rows && rows[0] && Number(rows[0].count)) || 0;
        return { statusCode: 200, body: JSON.stringify({ count }), headers: { 'Content-Type': 'application/json' } };
      }

      if (event.httpMethod === 'POST') {
        if (!validateSecret(event.headers)) {
          return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: { 'Content-Type': 'application/json' } };
        }
        await sql`CREATE TABLE IF NOT EXISTS sayz_counters (key TEXT PRIMARY KEY, count BIGINT DEFAULT 0)`;
        const rows = await sql`
          INSERT INTO sayz_counters (key, count) VALUES ('downloads', 1)
          ON CONFLICT (key) DO UPDATE SET count = sayz_counters.count + 1
          RETURNING count
        `;
        const count = (rows && rows[0] && Number(rows[0].count)) || 0;
        return { statusCode: 200, body: JSON.stringify({ count }), headers: { 'Content-Type': 'application/json' } };
      }
    }

    // Fallback to Upstash Redis REST if neon not configured or failed
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ error: 'No backend configured (NEON or UPSTASH variables missing)' }), headers: { 'Content-Type': 'application/json' } };
    }

    if (event.httpMethod === 'GET') {
      const count = await upstashGetCount();
      return { statusCode: 200, body: JSON.stringify({ count }), headers: { 'Content-Type': 'application/json' } };
    }

    if (event.httpMethod === 'POST') {
      if (!validateSecret(event.headers)) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }), headers: { 'Content-Type': 'application/json' } };
      }
      const count = await upstashIncrement();
      return { statusCode: 200, body: JSON.stringify({ count }), headers: { 'Content-Type': 'application/json' } };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }), headers: { 'Content-Type': 'application/json' } };
  }
};
