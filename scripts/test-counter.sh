#!/bin/bash
# Simple test script for Netlify function (local or deployed)
# Usage: ./scripts/test-counter.sh [base_url]
# If base_url omitted, defaults to http://localhost:8888

BASE=${1:-http://localhost:8888}
FUNC_PATH="$BASE/.netlify/functions/counter"

echo "GET current count from $FUNC_PATH"
curl -s "$FUNC_PATH" | jq

echo "POST incrementing..."
curl -s -X POST "$FUNC_PATH" | jq

echo "GET after increment"
curl -s "$FUNC_PATH" | jq
