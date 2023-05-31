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

export const getErrorMessage = (e) => {
  if (axios.isAxiosError(e) && e.response) {
    const { status, statusText } = e.response;
    const message = e.response.data?.message ?? e.message
    return `status: ${status}; statusText: ${statusText}; message: ${message}`
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
    return makeErrorResponse(500, getErrorMessage(error), functionName);
  }
};
