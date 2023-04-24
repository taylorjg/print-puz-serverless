const axios = require("axios");

const scrapePuzzleUrl = async () => {
  try {
    const response = await axios.get("http://www.private-eye.co.uk/crossword");
    const data = response.data;
    const regex = /(pictures\/crossword\/download\/[\d]+\.puz)/;
    const match = regex.exec(data);
    return match
      ? `http://www.private-eye.co.uk/${match[1]}`
      : null;
  } catch (error) {
    return error.message;
  }
};

module.exports.handler = async (event) => {
  const puzzleUrl = await scrapePuzzleUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        puzzleUrl,
        input: event,
      },
      null,
      2
    ),
  };
};
