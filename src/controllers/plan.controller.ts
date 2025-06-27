import * as express from "express";
import { Controller } from "@interfaces";
import planHelpers from "../controller-helpers/plan.helpers";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";

class PlanController implements Controller {
  public path = "";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(`/plans`, this.planList);
    this.router.get(`/provider/:address/plans`, this.getPlansByProviderAddress);
  };

  /**
   * It connect the wallet of the user helps in logging/sign up
   * and sends the cookie with the response
   * @param req
   * @param response
   * @returns
   */
  private planList = async (req: Request, res: Response) => {
    const limit= Number(req.query.limit);
    const page = Number(req.query.page);
    const countTotal = Boolean(req.query.count_total);
    const order = String(req.query.order); // order should "ASC" or "DESC"
    const planId = String(req.query.plan_id); // 
    const planData = await planHelpers.planList(limit, page, countTotal, order, planId);
    return sendResponse(res, planData);
  };

  private getPlansByProviderAddress = async (req: Request, res: Response) => {
    const providerAddress = String(req.params.provider_address);// Required
    const status = String(req.query.status);// this should can be active and inactive
    const limit= Number(req.query.limit);// limit can be anything but default 10
    const page = Number(req.query.page);// page can be anything but default 1
    const countTotal = Boolean(req.query.count_total);// true or false
    const order = String(req.query.order); // "ASC" or "DESC"
    const planDataByProviderAddress = await planHelpers.getPlansByProviderAddress(providerAddress,status,limit,page,countTotal,order);
    return sendResponse(res, planDataByProviderAddress);
  };
}

export default PlanController;
