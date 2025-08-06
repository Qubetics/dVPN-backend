import { ESResponse } from "@interfaces";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { HandlerParams } from "interfaces/handler.interfaces";

const errorHandler = ({
  data,
  status = STATUS_CODES.INTERNALSERVER,
  message = RESPONSE_MESSAGES.BASE_SUCCESS_MESSAGE
}: HandlerParams): ESResponse => {

  const response: ESResponse = {
    error: true,
    status: status,
    message: message
  };

  if (data) {
    response.data = data;
  }

  return response;
};

export default errorHandler;
