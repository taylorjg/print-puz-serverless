import axios from "axios";
import packageJson from "../package.json";

export const makeResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

export const makeErrorResponse = (statusCode, errorMessage) => {
  return makeResponse(statusCode, { error: errorMessage });
};

export const extractErrorMessage = (error) => {
  console.error("[extractErrorMessage]", error.toString());
  if (axios.isAxiosError(error) && error.response?.data) {
    if (error.response.data.toString) {
      console.error("[extractErrorMessage]", error.response.data.toString());
    } else {
      console.error("[extractErrorMessage]", error.response.data);
    }
  }
  return error.message;
};

export const wrapHandlerImplementation = async (
  endpointName,
  handlerImplementation
) => {
  try {
    console.info(
      "endpointName:",
      endpointName,
      "version:",
      packageJson.version
    );

    let specialResponse = undefined;
    const makeSpecialResponse = (statusCode, error) => {
      console.error("[makeSpecialResponse]", error);
      specialResponse = makeErrorResponse(statusCode, error);
    };

    const result = await handlerImplementation(makeSpecialResponse);
    return specialResponse ?? makeResponse(200, result);
  } catch (error) {
    console.error("Caught error:", error.message);
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const errorMessage = extractErrorMessage(error);
      return makeErrorResponse(statusCode, errorMessage);
    }
    return makeErrorResponse(500, error.message);
  }
};
