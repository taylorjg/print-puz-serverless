import axios from "axios";
import { readpuz } from "@confuzzle/readpuz";
import * as U from "./utils";

const PUZ_BLOCK = ".";
const MY_BLOCK = "X";
const MY_LETTER = ".";

const parsePuzzle = async (url) => {
  const config = { responseType: "arraybuffer" };
  const response = await axios.get(url, config);
  return readpuz(response.data);
};

const convertCharToMyFormat = (char) => char === PUZ_BLOCK ? MY_BLOCK : MY_LETTER;

const convertLineToMyFormat = (line) => {
  const chars = Array.from(line);
  return chars.map(convertCharToMyFormat).join("");
};

const parseGrid = (state, size) => {
  const grid = [];
  let curr = 0;
  for (; ;) {
    const line = state.slice(curr, curr + size);
    grid.push(convertLineToMyFormat(line));
    curr += size;
    if (curr >= size * size) break;
  }
  return grid;
};

const EN_DASH = 0x96;
const HYPHEN_MINUS = 0x2d;

// I'm not sure what encoding the .puz file is in (Windows-1250 ?)
// but there are several occurrences of 0x96 which I think is meant
// to be EN DASH. However, they seem to come out funny so I am
// converting them to ASCII 0x2d.
const convertEnDashToHyphenMinus = ch =>
  ch.codePointAt(0) === EN_DASH
    ? String.fromCodePoint(HYPHEN_MINUS)
    : ch;

const fixDashes = (clue) => Array.from(clue).map(convertEnDashToHyphenMinus).join("");

const computeNumberedSquares = grid => {

  const SIZE = grid.length;

  const isBlock = (rowIndex, colIndex) =>
    rowIndex < 0 || rowIndex >= SIZE ||
    colIndex < 0 || colIndex >= SIZE ||
    grid[rowIndex][colIndex] === MY_BLOCK;

  let currentClueNumber = 1;

  return grid.flatMap((gridLine, rowIndex) => {
    const chars = Array.from(gridLine);
    return chars.flatMap((char, colIndex) => {
      const isLetter = char === MY_LETTER;
      const leftIsBlock = isBlock(rowIndex, colIndex - 1);
      const rightIsBlock = isBlock(rowIndex, colIndex + 1);
      const aboveIsBlock = isBlock(rowIndex - 1, colIndex);
      const belowIsBlock = isBlock(rowIndex + 1, colIndex);
      const isAcrossClue = isLetter && leftIsBlock && !rightIsBlock;
      const isDownClue = isLetter && aboveIsBlock && !belowIsBlock;
      if (isAcrossClue || isDownClue) {
        return [{
          rowIndex,
          colIndex,
          isAcrossClue,
          isDownClue,
          clueNumber: currentClueNumber++,
        }];
      } else {
        return [];
      }
    });
  });
};

const partitionClues = (grid, clues) => {
  const numberedSquares = computeNumberedSquares(grid);

  const seed = {
    clueIndex: 0,
    acrossClues: [],
    downClues: []
  };

  const finalAcc = numberedSquares.reduce((acc, square) => {
    const { rowIndex, colIndex, isAcrossClue, isDownClue, clueNumber } = square;
    const acrossClues = isAcrossClue
      ? [{
        rowIndex,
        colIndex,
        clueNumber,
        clue: fixDashes(clues[acc.clueIndex])
      }]
      : [];
    const downClues = isDownClue
      ? [{
        rowIndex,
        colIndex,
        clueNumber,
        clue: fixDashes(clues[acc.clueIndex + acrossClues.length])
      }]
      : [];
    return {
      clueIndex: acc.clueIndex + acrossClues.length + downClues.length,
      acrossClues: acc.acrossClues.concat(acrossClues),
      downClues: acc.downClues.concat(downClues),
    };
  }, seed);

  const { acrossClues, downClues } = finalAcc;
  return { acrossClues, downClues };
};

export async function handler(event, _context, _callback) {
  return U.wrapHandlerImplementation("parse-puzzle", async (makeSpecialResponse) => {
    const puzzleUrl = event.queryStringParameters?.puzzleUrl;

    if (!puzzleUrl) {
      return makeSpecialResponse(400, "Missing puzzleUrl query string parameter");
    }

    const puzzle = await parsePuzzle(puzzleUrl);
    const grid = parseGrid(puzzle.state, puzzle.width);
    const { acrossClues, downClues } = partitionClues(grid, puzzle.clues);

    return {
      puzzleUrl,
      puzzle,
      grid,
      acrossClues,
      downClues,
    };
  });
};
