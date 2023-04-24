import axios from "axios";
import { readpuz } from "@confuzzle/readpuz"

const PRIVATE_EYE_WEBSITE_URL = "https://www.private-eye.co.uk";

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

export async function handler(event) {
  const puzzleUrl = await scrapePuzzleUrl();
  const puzzle = await parsePuzzle(puzzleUrl);
  return { puzzleUrl, puzzle };
}
