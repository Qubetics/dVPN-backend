import * as express from "express";
import { Controller } from "@interfaces";
import { Response } from "express";
import sendResponse from "../responses/response.helper";
import { sessionCheck } from "../middleware/sessionCheck";
import planHelpers from "../controller-helpers/plan.helpers";

class PlanController implements Controller {
    public path = "/plans";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, sessionCheck, this.getAllPlans);
    };

    private getAllPlans = async (req: any, res: Response) => {
        const provAddress=String(req.query.prov_address);
        const plansResponse = await planHelpers.getAllPlans(provAddress);
        return sendResponse(res, plansResponse);
    };

}

export default PlanController;