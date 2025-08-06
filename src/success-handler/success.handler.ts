import { ESResponse } from "@interfaces";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { HandlerParams } from "interfaces/handler.interfaces";

const successHandler = ({data, status = STATUS_CODES.SUCCESS, message = RESPONSE_MESSAGES.BASE_SUCCESS_MESSAGE}:HandlerParams): ESResponse => {
    return {
        error: false,
        status: status,
        data: data,
        message: message
    }
}

export default successHandler;