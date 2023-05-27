# Description

A while ago, I wrote a little web app to:

* Scrape a link to the current Private Eye cryptic crossword puzzle
* Download and parse the binary puzzle description
* Format the crossword puzzle using the same layout and styling as The Daily Telegraph

This used to be deployed to [Heroku](https://www.heroku.com/). When they discontinued their free tier,
I moved it to [Render](https://render.com/). This is fine but it seems to take longer to spin-up than it used to.

I'd really like to deploy it to `gh-pages`. But I need a backend - at least to scrape the link
from the Private Eye website. So, the purpose of this repo is to re-package my backend code
as AWS Lambda functions and deploy them using [Serverless Framework](https://www.serverless.com/framework).

# Serverless Functions

The backend comprises the following serverless functions:

* scrape-puzzle-url
  * Scrape a link to the current cryptic crossword puzzle from [Private Eye's crossword page](https://www.private-eye.co.uk/crossword)
  * e.g. https://www.private-eye.co.uk/pictures/crossword/download/753.puz
* list-puzzles
  * Parse the directory listing of https://www.private-eye.co.uk/pictures/crossword/download/
* parse-puzzle
  * Given the URL of a .puz file, read and parse the binary puzzle description and return it in an easy-to-consume JSON format

## scrape-puzzle-url

### Serverless CLI

```
serverless invoke --function scrape-puzzle-url
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
serverless invoke --function list-puzzles
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
  --function parse-puzzle \
  --data '{
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

* [.puz file format](https://code.google.com/archive/p/puz/wikis/FileFormat.wiki)
* [@confuzzle/readpuz](https://www.npmjs.com/package/@confuzzle/readpuz) npm package to read .puz files
* [Serverless Framework](https://www.serverless.com/framework)
* [Serverless Framework - Documentation](https://www.serverless.com/framework/docs)
* Existing print-puz web app
  * [repo](https://github.com/taylorjg/print-puz)
  * [deployed website](https://print-puz.onrender.com)
