import { ESResponse } from "@interfaces";
import { Response } from "express";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";

// send response
const sendResponse=(res:Response,resData: ESResponse)=>{
    try{
        // check if a status code arrive 
        const statusCode=resData?.status || STATUS_CODES.SUCCESS;
        const customMessage=resData?.message;

        //check if there is any mesaage or status code 500 then send response accordingly
        if(customMessage && statusCode!==STATUS_CODES.NOTFOUND){
            res.status(statusCode).send({message: customMessage,status:statusCode,data: resData?.data});
        }else if(statusCode===STATUS_CODES.INTERNALSERVER){
            res.status(statusCode).send({message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,status:statusCode});
        }else if(statusCode===STATUS_CODES.NOTFOUND){
            res.status(statusCode).send({
                message: customMessage || RESPONSE_MESSAGES.NOT_FOUND,
                status:statusCode,
                data: null
              });
        }else res.status(statusCode).send({data: resData.data});
    } catch(err) {
        res
        .status(STATUS_CODES.INTERNALSERVER)
        .send({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,status:STATUS_CODES.INTERNALSERVER});
    }
}

export default sendResponse;