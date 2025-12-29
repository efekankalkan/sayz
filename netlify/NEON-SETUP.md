# Neon (Netlify Database) Setup for Sayz counter

This document shows steps to provision and connect a Neon (Postgres) database to your Netlify site, so the `counter` Netlify Function will use it as the primary storage for the global download counter.

1) Provision Neon via Netlify (recommended)
- In your Netlify dashboard, open your Site and go to "Site settings" → "Add-ons" or "Databases" (UI may vary).
- Choose Neon (Netlify's Postgres offering) and follow the prompts to create a database and attach it to the site.
- Netlify will provision a database and automatically set `NETLIFY_DATABASE_URL` (or `NETLIFY_DATABASE_URL_UNPOOLED`) in the site's environment variables.

2) Optional: Add `NETLIFY_COUNTER_SECRET` to protect POST endpoints
- In Netlify Dashboard → Site settings → Build & deploy → Environment → Environment variables, add a variable named `NETLIFY_COUNTER_SECRET` with a strong random value.
- When this is set, POST requests to `/.netlify/functions/counter` must include an HTTP header `x-counter-secret: <value>`.

3) Local development with `netlify dev`
- Install Netlify CLI if you haven't:

```bash
npm i -g netlify-cli
```

- For local testing you can export environment variables (example):

```bash
export NETLIFY_DATABASE_URL="postgresql://user:pass@host:5432/dbname"
export NETLIFY_COUNTER_SECRET="my_secret"
netlify dev
```

or copy `.env.example` to `.env` and load it into your shell before running `netlify dev`.

4) Verifying the function
- With `netlify dev` running, test the function:

```bash
# GET current count
curl -s http://localhost:8888/.netlify/functions/counter | jq

# POST increment (with secret header if used)
curl -s -X POST -H "x-counter-secret: $NETLIFY_COUNTER_SECRET" http://localhost:8888/.netlify/functions/counter | jq
```

5) Notes
- The function attempts to create the table `sayz_counters` automatically; it stores a single row with key `downloads`.
- If you prefer Upstash (Redis) instead, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Netlify envs and the function will fall back to that.

6) Troubleshooting
- If the function returns `500` complaining about missing backend variables, ensure at least one of `NETLIFY_DATABASE_URL` or `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` is set.
- For Postgres errors, check the Neon dashboard and make sure the DB user/password are valid and the database allows Netlify functions access.

