import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import sessionHelper from "../controller-helpers/session.helper";

class SentinelController implements Controller {
  public path = "";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(`/sessions`, this.getSessions);
  };

  private getSessions = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const countTotal = Boolean(req.query.count_total);
    // const key = String(req.query.key);
    const order = String(req.query.order);
    const sessionId=String(req.query.session_id);
    const sessions = await sessionHelper.sessionList(
      limit,
      page,
      countTotal,
      order
    );

    return sendResponse(res, sessions);
  };

  private getSessionParam = async (req: Request, res:Response) => {
     const sessionParmasData=await sessionHelper.sessionParmas(req,res);
     return sendResponse(res,sessionParmasData);
  }
}

export default SentinelController;
