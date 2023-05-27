import axios from "axios";
import { readpuz } from "@confuzzle/readpuz"

const PRIVATE_EYE_WEBSITE_URL = "https://www.private-eye.co.uk";

const PUZ_BLOCK = ".";
const MY_BLOCK = "X";
const MY_LETTER = ".";

const scrapePuzzleUrl = async () => {
  try {
    const response = await axios.get(`${PRIVATE_EYE_WEBSITE_URL}/crossword`);
    const data = response.data;
    const regex = /(pictures\/crossword\/download\/[\d]+\.puz)/;
    const match = regex.exec(data);
    return match
      ? `${PRIVATE_EYE_WEBSITE_URL}/${match[1]}`
      : null;
  } catch (error) {
    return error.message;
  }
};

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
        clue: clues[acc.clueIndex]
      }]
      : [];
    const downClues = isDownClue
      ? [{
        rowIndex,
        colIndex,
        clueNumber,
        clue: clues[acc.clueIndex + acrossClues.length]
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

export async function handler(_event, _context, _callback) {
  const puzzleUrl = await scrapePuzzleUrl();
  const puzzle = await parsePuzzle(puzzleUrl);
  const grid = parseGrid(puzzle.state, puzzle.width);
  const { acrossClues, downClues } = partitionClues(grid, puzzle.clues);
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      puzzleUrl,
      puzzle,
      grid,
      acrossClues,
      downClues,
    })
  };
  return response;
}
