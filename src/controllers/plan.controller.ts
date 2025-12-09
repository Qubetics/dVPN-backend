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
        // this.router.get(`${this.path}/node`, sessionCheck,this.getAllNodeForPlan);
        // this.router.post(`${this.path}/id`,sessionCheck,this.postForPlanId);
        // this.router.get(`${this.path}/id`,sessionCheck,this.getPlanId);
    };

    private getAllPlans = async (req: any, res: Response) => {
        // const walletAddress=String(req.user.wallet_address);
        const provAddress=String(req.query?.prov_address);
        const country=String(req.query?.country);
        const plansResponse = await planHelpers.getAllPlans(provAddress,country);
        return sendResponse(res, plansResponse);
    };

    private getAllNodeForPlan = async (req: any, res: Response) => {
        const walletAddress=String(req.user.wallet_address);
        const limit = Number(req.query?.limit) || 10;
        const page = Number(req.query?.page) || 1;
        const plansResponse = await planHelpers.getAllNodeForPlan(walletAddress,page, limit);
        return sendResponse(res, plansResponse);
    };

    private postForPlanId = async (req:any,res:Response)=>{
       const walletAddress=String(req.user.wallet_address);
       const TxHash=String(req.body.txhash);
       const responsePlanId=await planHelpers.postForPlanId(walletAddress,TxHash);
       return sendResponse(res,responsePlanId);
    };

    private getPlanId = async (req:any,res:Response)=>{
        const walletAddress=String(req.user.wallet_address);
        const resPlanID=await planHelpers.getPlanId(walletAddress);
        return sendResponse(res,resPlanID); 
    };

    private getUserPurchasedPlans = async (req:any,res:Response)=>{
        const walletAddress=String(req.user.wallet_address);
        const getUserPurchasedPlanList=await planHelpers.getPlanId(walletAddress);
        return sendResponse(res,getUserPurchasedPlanList);
    }

}

export default PlanController;