import { describe, expect, it } from "vitest";

import { handler as scrapePuzzleUrlHandler } from "../src/scrape-puzzle-url.js";
import { handler as listPuzzlesHandler } from "../src/list-puzzles.js";
import { handler as parsePuzzleHandler } from "../src/parse-puzzle.js";

const SAMPLE_PUZZLE_URL =
  "https://www.private-eye.co.uk/pictures/crossword/download/833.puz";

const parseResponseBody = (response) => JSON.parse(response.body);

describe("scrape-puzzle-url", () => {
  it("returns the current puzzle URL", async () => {
    const response = await scrapePuzzleUrlHandler({});
    const body = parseResponseBody(response);

    expect(response.statusCode).toBe(200);
    expect(body.puzzleUrl).toMatch(
      /^https:\/\/www\.private-eye\.co\.uk\/pictures\/crossword\/download\/\d+\.puz$/
    );
  });
});

describe("list-puzzles", () => {
  it("returns available puzzle downloads", async () => {
    const response = await listPuzzlesHandler({});
    const body = parseResponseBody(response);

    expect(response.statusCode).toBe(200);
    expect(body.puzzles.length).toBeGreaterThan(0);
    expect(body.puzzles[0].url).toMatch(/\.puz$/);
    expect(body.puzzles[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("parse-puzzle", () => {
  it("parses a puzzle from a URL", async () => {
    const response = await parsePuzzleHandler({
      queryStringParameters: { puzzleUrl: SAMPLE_PUZZLE_URL },
    });
    const body = parseResponseBody(response);

    expect(response.statusCode).toBe(200);
    expect(body.puzzleUrl).toBe(SAMPLE_PUZZLE_URL);
    expect(body.grid.length).toBeGreaterThan(0);
    expect(body.acrossClues.length).toBeGreaterThan(0);
    expect(body.downClues.length).toBeGreaterThan(0);
    expect(body.puzzle.title).toBe("Eye 833/1678");
  });
});
