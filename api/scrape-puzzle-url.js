import axios from "axios";
import { makeResponse } from "./utils";

const PRIVATE_EYE_WEBSITE_URL = "https://www.private-eye.co.uk";

export const scrapePuzzleUrl = async () => {
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

export async function handler(_event, _context, _callback) {
  const puzzleUrl = await scrapePuzzleUrl();
  return makeResponse(200, { puzzleUrl });
}
