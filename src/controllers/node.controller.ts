import * as express from "express";
import { Controller } from "@interfaces";
import {  Response } from "express";
import sendResponse from "../responses/response.helper";
import nodeHelpers from "../controller-helpers/node.helpers";
import { sessionCheck } from "../middleware/sessionCheck";

class NodeController implements Controller {
  public path = "";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/nodes", sessionCheck, this.getNodeList);
    this.router.get("/nodes/random",sessionCheck,this.getRandomNodeData);
  };

  /**
   * Retrieves a paginated list of nodes with optional filters like status, address, country, and city.
   * @param req
   * @param res
   * @returns
   */
  private getNodeList = async (req: any, res: Response) => {
    const status = String(req.query.status);
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const countTotal = Boolean(req.query.count_total);
    const order = String(req.query.order);
    const nodeAddress = String(req.query.address);
    const country = String(req.query.country);
    const city = String(req.query.city);
    const planId= Number(req.query?.plan_id);
    const nodeListData = await nodeHelpers.nodeList(
      status,
      limit,
      page,
      countTotal,
      order,
      nodeAddress,
      country,
      city,
      planId
    );

    return sendResponse(res, nodeListData);
  };
  /**
   * Retrieves data of a randomly selected node.
   * @param req 
   * @param res 
   * @returns 
   */
  private getRandomNodeData = async (req:any,res: Response) => {
    const randomNodeResponse = await nodeHelpers.getRandomNode();
    return sendResponse(res,randomNodeResponse);
  };

}

export default NodeController;