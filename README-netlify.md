# Deploying the Sayz counter as a Netlify Function (Upstash Redis)

This project includes a Netlify Function at `netlify/functions/counter.js` which supports two backends:

- Neon (Postgres) via Netlify's Neon integration (preferred) using env vars `NETLIFY_DATABASE_URL` or `NETLIFY_DATABASE_URL_UNPOOLED`.
- Upstash Redis REST via `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (fallback if Neon not configured).

## Supported environment variables (set these in Netlify Site settings)
- `NETLIFY_DATABASE_URL` or `NETLIFY_DATABASE_URL_UNPOOLED` — Neon / Postgres connection (optional, preferred)
- `UPSTASH_REDIS_REST_URL` — Your Upstash REST endpoint (e.g. `https://<id>.upstash.io`) (fallback)
- `UPSTASH_REDIS_REST_TOKEN` — The Upstash REST token (keep secret)
- `NETLIFY_COUNTER_SECRET` — *optional* simple secret string; if set, POST requests must include header `x-counter-secret: <value>`

## How it works
- `GET /.netlify/functions/counter` — returns `{ "count": <number> }` (reads key via `GET` command)
- `POST /.netlify/functions/counter` — increments the key via `INCR` and returns the new `{ "count": <number> }`

The frontend expects the function at `/.netlify/functions/counter` by default (or you can set `window.SAYZ_API_BASE` to a custom base URL).

## Deploying (quick steps)
1. Create a Netlify site and connect your GitHub repository (or drag & drop the repo).
2. In the Netlify dashboard for your site, go to **Site settings → Build & deploy → Environment → Environment variables** and add the two variables listed above.
3. Deploy the site. Netlify will build and publish, and the function will be available at the path above.

## Local testing with Netlify CLI
Install Netlify CLI (if not installed):

```bash
npm i -g netlify-cli
```

Then run this in the repo root:

```bash
# serve the site + functions locally
netlify dev
```

Set your environment variables locally (example, macOS/Linux):

```bash
# copy .env.example -> .env and edit, or export variables directly
export NETLIFY_DATABASE_URL="postgresql://..."  # or NETLIFY_DATABASE_URL_UNPOOLED
export UPSTASH_REDIS_REST_URL="https://....upstash.io"   # optional fallback
export UPSTASH_REDIS_REST_TOKEN="your_token_here"        # optional fallback
export NETLIFY_COUNTER_SECRET="my_secret_value"         # optional
netlify dev
```

Or use the included helper template `scripts/set-netlify-env.sh` as a starting point for `netlify env:set` commands.

The function will be available at `http://localhost:8888/.netlify/functions/counter` while `netlify dev` runs.

## Quick curl tests
After deploy or while running `netlify dev`, test with:

```bash
# GET count
curl -s https://your-site.netlify.app/.netlify/functions/counter | jq

# POST increment
curl -s -X POST https://your-site.netlify.app/.netlify/functions/counter | jq
```

For local `netlify dev` (default port 8888):

```bash
curl -s http://localhost:8888/.netlify/functions/counter | jq
curl -s -X POST http://localhost:8888/.netlify/functions/counter | jq

If you configured `NETLIFY_COUNTER_SECRET`, include it in POSTs:

```bash
curl -s -X POST -H "x-counter-secret: $NETLIFY_COUNTER_SECRET" http://localhost:8888/.netlify/functions/counter | jq
```

## Neon (Postgres) notes

If you want to use the Neon/Postgres backend (recommended for durability):

- Set `NETLIFY_DATABASE_URL` (Netlify provisioning for Neon will set this automatically when you attach a Neon database in Netlify UI).
- The function will automatically create a table `sayz_counters` if it does not exist. The table schema used is:

```sql
CREATE TABLE IF NOT EXISTS sayz_counters (
	key TEXT PRIMARY KEY,
	count BIGINT DEFAULT 0
);
```

Insertion/upsert uses:

```sql
INSERT INTO sayz_counters (key, count) VALUES ('downloads', 1)
ON CONFLICT (key) DO UPDATE SET count = sayz_counters.count + 1
RETURNING count;
```

This keeps a single key `downloads` for the global counter.
```

## Security & Notes
- The function performs unauthenticated increments. Consider adding a simple secret token check (e.g., `Authorization` header or query token) if you're concerned about abuse.
- Upstash has rate limits and a free tier — monitor usage.

*** End of README ***
