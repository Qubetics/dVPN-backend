import * as express from "express";
import { Controller } from "@interfaces";
// import UserHelper from "../controller-helpers/user.helpers"
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
    // this.router.get(`/plan`,this.getPlanById);
    this.router.get(`/:plan_id/nodes`, this.getAllByPlanId);
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

  private getAllByPlanId = async (req: Request, res: Response) => {
    const limit= Number(req.query.limit);
    const page = Number(req.query.page);
    const countTotal = Boolean(req.query.count_total);
    const order = String(req.query.order); // order should "ASC" or "DESC"
    const planId = String(req.params.plan_id); // 
    const planDataByPlanId = await planHelpers.getAllByPlanId(planId,limit,page,countTotal,order);
    return sendResponse(res, planDataByPlanId);
  };
}

export default PlanController;
