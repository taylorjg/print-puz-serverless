import axios from "axios";
import * as C from "./constants";
import * as U from "./utils";

export const scrapePuzzleUrl = async () => {
  const response = await axios.get(`${C.PRIVATE_EYE_WEBSITE_URL}/crossword`);
  const data = response.data;
  const regex = /(pictures\/crossword\/download\/[\d]+\.puz)/;
  const match = regex.exec(data);
  return match
    ? `${C.PRIVATE_EYE_WEBSITE_URL}/${match[1]}`
    : null;
};

export async function handler(/* event, context, callback */) {
  return U.wrapHandlerImplementation(async () => {
    const puzzleUrl = await scrapePuzzleUrl();
    return { puzzleUrl };
  });
};
