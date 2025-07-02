import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import nodeHelpers from "../controller-helpers/node.helpers";
import { sessionCheck } from "../middleware/sessionCheck";

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
        const order = String(req.query.order);
        const nodeAddress = String(req.query.address);
        const country = String(req.query.country);  
        console.log("🚀 ~ NodeController ~ nodeList= ~ country:", country)
        const city = String(req.query.city);       
      
        const planData = await nodeHelpers.nodeList(
          status,
          limit,
          page,
          countTotal,
          order,
          nodeAddress,
          country,
          city
        );
      
        return sendResponse(res, planData);
      };
      
}

export default NodeController;