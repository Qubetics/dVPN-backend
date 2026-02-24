import * as express from "express";
import { Controller } from "@interfaces";
import { Response } from "express";
import sendResponse from "../responses/response.helper";
import { sessionCheck } from "../middleware/sessionCheck";
import appHelpers from "../controller-helpers/app.helpers";
require('dotenv').config();

class AppController implements Controller {
    public path = "/app";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/version`, sessionCheck, this.getApplicationVersion);
        this.router.get(`${this.path}/chainUrl`, sessionCheck, this.getChainURL);
        if (process.env.NODE_ENV == 'production') {
            this.router.get(`${this.path}/current-token-price`, this.getCurrentTokenPrice);
        }
    };

    private getApplicationVersion = (req: any, res: Response) => {
        const appVersionResponse = appHelpers.getApplicationVersion();
        return sendResponse(res, appVersionResponse);
    }

    private getChainURL = (req: any, res: Response) => {
        const chainUrlResponse = appHelpers.getChainURL();
        return sendResponse(res, chainUrlResponse);
    }

    private getCurrentTokenPrice = async (req: any, res: Response) => {
        const currentTokenPriceResponse = await appHelpers.getCurrentTokenPrice();
        return sendResponse(res, currentTokenPriceResponse);
    }
}

export default AppController;