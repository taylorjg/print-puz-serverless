import axios from "axios";
import { makeResponse } from "./utils";
import * as C from "./constants";

export const parseDownloadPage = async () => {
  try {
    const response = await axios.get(`${C.PRIVATE_EYE_WEBSITE_URL}/pictures/crossword/download/`);
    const data = response.data;
    const regex = /[<]tr[>](.*?)[<][/]tr[>]/g;
    const matches = data.matchAll(regex)
    const puzzles = []
    for (const match of matches) {
      const row = match?.[1] ?? ""
      if (row.includes(".puz")) {
        const filename = row.match(/href="([^"]*)"/)?.[1]
        const timestamp = row.match(/[>](\d{4}-\d{2}-\d{2})/)?.[1]
        if (filename && timestamp) {
          puzzles.push({
            filename: `${C.PRIVATE_EYE_WEBSITE_URL}/pictures/crossword/download/${filename}`,
            timestamp })
        }
      }
    }
    return puzzles
  } catch (error) {
    return error.message;
  }
};

export async function handler(_event, _context, _callback) {
  const puzzles = await parseDownloadPage();
  return makeResponse(200, { puzzles });
}
