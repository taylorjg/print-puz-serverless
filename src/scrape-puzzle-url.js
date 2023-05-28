import axios from "axios";
import { makeResponse } from "./utils";
import * as C from "./constants";

export const scrapePuzzleUrl = async () => {
  try {
    const response = await axios.get(`${C.PRIVATE_EYE_WEBSITE_URL}/crossword`);
    const data = response.data;
    const regex = /(pictures\/crossword\/download\/[\d]+\.puz)/;
    const match = regex.exec(data);
    return match
      ? `${C.PRIVATE_EYE_WEBSITE_URL}/${match[1]}`
      : null;
  } catch (error) {
    return error.message;
  }
};

export async function handler(_event, _context, _callback) {
  const puzzleUrl = await scrapePuzzleUrl();
  return makeResponse(200, { puzzleUrl });
}
