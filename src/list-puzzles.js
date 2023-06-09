import axios from "axios";
import * as C from "./constants";
import * as U from "./utils";

export const parseDownloadPage = async () => {
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
        const url = `${C.PRIVATE_EYE_WEBSITE_URL}/pictures/crossword/download/${filename}`;
        puzzles.push({ url, timestamp })
      }
    }
  }
  return puzzles
};

export async function handler(/* event, context, callback */) {
  return U.wrapHandlerImplementation("list-puzzles", async () => {
    const puzzles = await parseDownloadPage();
    return { puzzles };
  });
};
