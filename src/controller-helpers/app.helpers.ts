import { RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
require('dotenv').config();

class AppHelper {

    constructor() {
        (() => { })();
    }

    /**
     * The helper be which we can get the version of the application
     */
    public getApplicationVersion = (): ApiResponse => {
        try {
            const appVersion = process.env.APP_VERSION;
            if (!appVersion) {
                return errorHandler({ message: RESPONSE_MESSAGES.APP_VERSION_IS_MISSING, status: STATUS_CODES.BADREQUEST });
            }
            return successHandler({
                data: { version: appVersion },
                message: RESPONSE_MESSAGES.APP_VERSION_SUCCESSFULLY_FETCH,
                status: STATUS_CODES.SUCCESS
            })
        } catch (err: any) {
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            });
        }
    }

    /**
     * The helper be which we can get the chain URL of the applcation
     */
    public getChainURL = (): ApiResponse => {
        try {
            const chainUrl = process.env.CHAIN_URL;
            if (!chainUrl) {
                return errorHandler({
                    message: RESPONSE_MESSAGES.CHAIN_URL_IS_MISSING,
                    status: STATUS_CODES.BADREQUEST,
                })
            }
            return successHandler({
                data: { ChainURL: chainUrl },
                message: RESPONSE_MESSAGES.CHAIN_URL_SUCCESSFULLY_FETCH,
                status: STATUS_CODES.SUCCESS
            });
        } catch (err) {
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            });
        }
    }

}

export default new AppHelper();