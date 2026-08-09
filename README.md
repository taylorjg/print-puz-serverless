[![CI/CD](https://github.com/taylorjg/print-puz-serverless/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/taylorjg/print-puz-serverless/actions/workflows/ci-cd.yml)

# Description

A while ago, I wrote [a little web app](https://github.com/taylorjg/print-puz) to:

- Scrape a link to the current Private Eye cryptic crossword puzzle
- Download and parse the binary puzzle description
- Format the crossword puzzle using the same layout and styling as The Daily Telegraph

This used to be deployed to [Heroku](https://www.heroku.com/). When they discontinued their free tier,
I moved it to [Render](https://render.com/). This is fine but it seems to take longer to spin-up than it used to.

I'd really like to deploy it to `gh-pages`. But I need a backend - at least to scrape the link
from the Private Eye website. So, the purpose of this repo is to re-package my backend code
as AWS Lambda functions and deploy them using [Serverless Framework](https://www.serverless.com/framework).

I have started work on a new frontend web app to consume these serverless functions:

- Repo: https://github.com/taylorjg/print-puz-react-vite
- Deployed website: https://taylorjg.github.io/print-puz-react-vite/

## Development

```bash
npm ci
npm run lint              # ESLint (includes Prettier)
npm test                  # Handler integration tests (live Private Eye website)
npm run invoke:local      # Smoke-test all handlers via serverless invoke local
npm run check             # lint + test + invoke:local (same as CI)
```

Post-deploy smoke tests (manual — requires AWS credentials and a deployed stack):

```bash
npm run invoke:deployed   # Invoke all deployed Lambdas
npm run invoke:curl       # Hit deployed HTTP API
```

| Command                   | Network                 | Secrets / credentials                         |
| ------------------------- | ----------------------- | --------------------------------------------- |
| `npm test`                | Yes (Private Eye)       | None                                          |
| `npm run invoke:local`    | Yes (Private Eye)       | `SERVERLESS_ACCESS_KEY` for Serverless v4 CLI |
| `npm run invoke:deployed` | Yes (Private Eye + AWS) | AWS profile + `SERVERLESS_ACCESS_KEY`         |
| `npm run invoke:curl`     | Yes (deployed API)      | None (uses URL in script)                     |

Helper scripts live in `scripts/` (`invoke-all-local.sh`, `invoke-all-deployed.sh`, `curl-all.sh`).

## Deploy

```bash
npm run deploy
npm run info
```

Deploy scripts set `SLS_AWS_SDK=3` for AWS SDK v3 compatibility with Serverless v4. AWS credentials (local profile `taylorjg`) are required; Serverless v4 also needs `SERVERLESS_ACCESS_KEY`.

## CI

GitHub Actions runs `npm run check` on every push and pull request. The `check` job is required for merges to `main`.

CI requires a repository secret named `SERVERLESS_ACCESS_KEY` for Serverless Framework v4 authentication.

# Serverless Functions

The backend comprises the following serverless functions:

- scrape-puzzle-url
  - Scrape a link to the current cryptic crossword puzzle from [Private Eye's crossword page](https://www.private-eye.co.uk/crossword)
  - e.g. https://www.private-eye.co.uk/pictures/crossword/download/753.puz
- list-puzzles
  - Parse the directory listing of https://www.private-eye.co.uk/pictures/crossword/download/
- parse-puzzle
  - Given the URL of a .puz file, read and parse the binary puzzle description and return the parsed puzzle, plus some extended information, in JSON format

## scrape-puzzle-url

### Serverless CLI

```
serverless invoke -f scrape-puzzle-url
```

### Curl

```
curl https://fr0r2wv048.execute-api.us-east-1.amazonaws.com/scrape-puzzle-url -s | jq
```

### Browser GET Request

https://fr0r2wv048.execute-api.us-east-1.amazonaws.com/scrape-puzzle-url

## list-puzzles

### Serverless CLI

```
serverless invoke -f list-puzzles
```

### Curl

```
curl https://fr0r2wv048.execute-api.us-east-1.amazonaws.com/list-puzzles -s | jq
```

### Browser GET Request

https://fr0r2wv048.execute-api.us-east-1.amazonaws.com/list-puzzles

## parse-puzzle

### Serverless CLI

```
serverless invoke \
  -f parse-puzzle \
  -d '{
    "queryStringParameters": {
      "puzzleUrl": "https://www.private-eye.co.uk/pictures/crossword/download/753.puz"
    }
  }'
```

### Curl

```
curl "https://fr0r2wv048.execute-api.us-east-1.amazonaws.com/parse-puzzle?puzzleUrl=https://www.private-eye.co.uk/pictures/crossword/download/753.puz" -s | jq
```

### Browser GET Request

https://fr0r2wv048.execute-api.us-east-1.amazonaws.com/parse-puzzle?puzzleUrl=https://www.private-eye.co.uk/pictures/crossword/download/753.puz

# Links

- [.puz file format](https://code.google.com/archive/p/puz/wikis/FileFormat.wiki)
- [@confuzzle/readpuz](https://www.npmjs.com/package/@confuzzle/readpuz) npm package to read .puz files
- [Serverless Framework](https://www.serverless.com/framework)
- [Serverless Framework - Documentation](https://www.serverless.com/framework/docs)
- Existing print-puz web app
  - [repo](https://github.com/taylorjg/print-puz)
  - [deployed website](https://print-puz.onrender.com)
