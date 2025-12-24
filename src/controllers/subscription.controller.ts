import * as express from "express";
import { Controller } from "@interfaces";
import { Response } from "express";
import sendResponse from "../responses/response.helper";
import { sessionCheck } from "../middleware/sessionCheck";
import subscriptionHelper from "../controller-helpers/subscription.helper";

class SubscriptionController implements Controller {
    public path = "/subscription";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, sessionCheck, this.getSubscritptionsList);
        this.router.get(`${this.path}/renew`, sessionCheck, this.getRenewSubscriptions);
    };

    private getSubscritptionsList = async (req: any, res: Response) => {
        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const order = String(req.query.order);
        const wallet_address = String(req.user.wallet_address);

        const subscritpionListRespose=await subscriptionHelper.getSubscritptionsList(wallet_address,
            limit,
            page,
            order
        );

        return sendResponse(res,subscritpionListRespose);
    };

    private getRenewSubscriptions = async (req: any, res: Response) => {
        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const order = String(req.query.order);
        const wallet_address = String(req.user.wallet_address);

        const subscritpionListRespose=await subscriptionHelper.getRenewSubscriptions(wallet_address,
            limit,
            page,
            order
        );

        return sendResponse(res,subscritpionListRespose);
    };
}

export default SubscriptionController;