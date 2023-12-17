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
  return U.wrapHandlerImplementation("scrape-puzzle-url", async (makeSpecialResponse) => {
    const puzzleUrl = await scrapePuzzleUrl();
    if (puzzleUrl === null) {
      return makeSpecialResponse(404, "Failed to find .puz url on current crossword page");
    }
    return { puzzleUrl };
  });
};
