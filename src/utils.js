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

export const getErrorMessage = (e) => {
  if (axios.isAxiosError(e) && e.response) {
    const { status, statusText } = e.response;
    const message = e.response.data?.message ?? e.message
    return `status: ${status}; statusText: ${statusText}; message: ${message}`
  }
  return e.message;
};

export const wrapHandlerImplementation = async (handlerImplementation) => {
  try {
    const result = await handlerImplementation();
    return makeResponse(200, result);
  } catch (error) {
    return makeResponse(500, { error: getErrorMessage(error) });
  }
};
