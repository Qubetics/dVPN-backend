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
    };

    private getSubscritptionsList = async (req: any, res: Response) => {
        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        const countTotal = Boolean(req.query.count_total);
        const order = String(req.query.order);
        const wallet_address = String(req.user.wallet_address);

        const subscritpionListRespose=await subscriptionHelper.getSubscritptionsList(wallet_address,
            limit,
            page,
            countTotal,
            order
        );

        return sendResponse(res,subscritpionListRespose);
    };
}

export default SubscriptionController;