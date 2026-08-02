#!/usr/bin/env bash

# Run via: npm run invoke:deployed
# Requires AWS credentials and a deployed stack.

set -euo pipefail

export SLS_AWS_SDK=3

SAMPLE_PUZZLE_URL="https://www.private-eye.co.uk/pictures/crossword/download/833.puz"

echo "=== scrape-puzzle-url ==="
serverless invoke -f scrape-puzzle-url
echo

echo "=== list-puzzles ==="
serverless invoke -f list-puzzles
echo

echo "=== parse-puzzle ==="
serverless invoke -f parse-puzzle -d "$(cat <<EOF
{
  "queryStringParameters": {
    "puzzleUrl": "${SAMPLE_PUZZLE_URL}"
  }
}
EOF
)"
