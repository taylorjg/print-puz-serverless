import axios from "axios";

export const makeResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body)
  };
};

export const makeErrorResponse = (statusCode, error, functionName) => {
  const enhancedError = `[${functionName}] ${error}`;
  return makeResponse(statusCode, { error: enhancedError });
};

const extractErrorMessage = (e) => {
  if (axios.isAxiosError(e) && e.response) {
    // TODO: we could/should log e.response.data;
  }
  return e.message;
};

export const wrapHandlerImplementation = async (functionName, handlerImplementation) => {
  try {
    let specialResponse = undefined;
    const makeSpecialResponse = (statusCode, error) => {
      specialResponse = makeErrorResponse(statusCode, error, functionName);
    };

    const result = await handlerImplementation(makeSpecialResponse);
    return specialResponse ?? makeResponse(200, result);
  } catch (error) {
    return makeErrorResponse(500, extractErrorMessage(error), functionName);
  }
};
