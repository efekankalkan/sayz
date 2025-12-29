# Deploying the Sayz counter as a Netlify Function (Upstash Redis)

This project already includes a Netlify Function at `netlify/functions/counter.js` which uses Upstash Redis REST API to store a single global counter key: `sayz:download_count`.

## Required environment variables (set these in Netlify Site settings)
- `UPSTASH_REDIS_REST_URL` — Your Upstash REST endpoint (e.g. `https://<id>.upstash.io`)
- `UPSTASH_REDIS_REST_TOKEN` — The Upstash REST token (keep secret)

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
export UPSTASH_REDIS_REST_URL="https://....upstash.io"
export UPSTASH_REDIS_REST_TOKEN="your_token_here"
netlify dev
```

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
```

## Security & Notes
- The function performs unauthenticated increments. Consider adding a simple secret token check (e.g., `Authorization` header or query token) if you're concerned about abuse.
- Upstash has rate limits and a free tier — monitor usage.

*** End of README ***
