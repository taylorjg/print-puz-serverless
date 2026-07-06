#!/usr/bin/env bash

# Run via: npm run test:invoke-all
set -euo pipefail

cd "$(dirname "$0")/.."

SAMPLE_PUZZLE_URL="https://www.private-eye.co.uk/pictures/crossword/download/833.puz"

echo "=== scrape-puzzle-url ==="
serverless invoke --function scrape-puzzle-url
echo

echo "=== list-puzzles ==="
serverless invoke --function list-puzzles
echo

echo "=== parse-puzzle ==="
serverless invoke --function parse-puzzle --data "$(cat <<EOF
{
  "queryStringParameters": {
    "puzzleUrl": "${SAMPLE_PUZZLE_URL}"
  }
}
EOF
)"
