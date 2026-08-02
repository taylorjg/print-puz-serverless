#!/usr/bin/env bash

# Run via: npm run invoke:curl
# Hits the deployed HTTP API (no AWS credentials required).

set -euo pipefail

DEPLOYED_URL="https://fr0r2wv048.execute-api.us-east-1.amazonaws.com"
SAMPLE_PUZZLE_URL="https://www.private-eye.co.uk/pictures/crossword/download/833.puz"

echo "=== scrape-puzzle-url ==="
curl -X GET "${DEPLOYED_URL}/scrape-puzzle-url" -s | jq
echo

echo "=== list-puzzles ==="
curl -X GET "${DEPLOYED_URL}/list-puzzles" -s | jq
echo

echo "=== parse-puzzle ==="
curl -G "${DEPLOYED_URL}/parse-puzzle" --data-urlencode "puzzleUrl=${SAMPLE_PUZZLE_URL}" -s | jq
echo
