import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import nodeHelpers from "../controller-helpers/node.helpers";

class NodeController implements Controller {
    public path="";
    public router= express.Router();

    constructor() {
      // this.router=express.Router();
       this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/nodes",this.nodeList);
    };

      /**
   * It connect the wallet of the user helps in logging/sign up
   * and sends the cookie with the response
   * @param req
   * @param response
   * @returns
   */
  private nodeList = async (req: Request, res: Response) => {
    console.log("start");
    const status = String(req.query.status);
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const countTotal = Boolean(req.query.count_total);
    const order = String(req.query.order); // order should "ASC" or "DESC"
    const nodeAddress = String(req.query.address); // 
    const planData = await nodeHelpers.nodeList(status,limit, page, countTotal, order, nodeAddress);
    return sendResponse(res, planData);
  };
}

export default NodeController;