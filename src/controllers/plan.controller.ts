import * as express from "express";
import { Controller } from "@interfaces";
// import UserHelper from "../controller-helpers/user.helpers"
import planHelpers from "../controller-helpers/plan.helpers";
import { Request,Response } from "express";
import sendResponse from "../responses/response.helper";

class PlanController implements Controller {
    public path="";
    public router=express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes=()=>{
        this.router.get(`/plans`,this.planList);
        this.router.get(`/plan`,this.getPlanById);
        this.router.get(`/nodes/by-plan`,this.getAllByPlanId);
    }

    /**
     * It connect the wallet of the user helps in logging/sign up
     * and sends the cookie with the response
     * @param req
     * @param response
     * @returns
     */
    private planList=async (req:Request,res:Response) => {
        const planData=await planHelpers.planList(req,res);
        return sendResponse(res,planData);
    };
  /**
   * It handles the user logout helper
   * @param req
   * @param res
   * @returns
   */
    private getPlanById=async (req:Request,res:Response)=> {
        const planDataById=await planHelpers.getPlanById(req,res);
        return sendResponse(res,planDataById);
    };

    private getAllByPlanId=async (req:Request,res:Response)=>{
        const planDataByPlanId=await planHelpers.getAllByPlanId(req,res);
        return sendResponse(res,planDataByPlanId);
    };


}

export default PlanController;