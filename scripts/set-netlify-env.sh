#!/usr/bin/env bash
# Helper: set Netlify environment variables via Netlify CLI
# Usage: ./scripts/set-netlify-env.sh
# Requires: netlify CLI logged in and site linked (run `netlify link` if needed)

# WARNING: This script echoes examples only — do NOT commit your real secrets.

# Example usage (uncomment and set values):
# netlify env:set NETLIFY_DATABASE_URL "postgresql://user:pass@host:5432/dbname"
# netlify env:set UPSTASH_REDIS_REST_URL "https://<id>.upstash.io"
# netlify env:set UPSTASH_REDIS_REST_TOKEN "your_upstash_token"
# netlify env:set NETLIFY_COUNTER_SECRET "your_secret_value"

echo "Edit this file to run the netlify env:set commands for your site."
