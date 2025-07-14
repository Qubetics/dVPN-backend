import * as express from "express";
import { Controller } from "@interfaces";
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import UserSessionHelper from "../controller-helpers/user-session.helpers"
import { sessionCheck } from "../middleware/sessionCheck";

class UserSessionController implements Controller {
  public path = "";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(`/user-sessions`,sessionCheck, this.getSessions);
  };

  private getSessions = async (req: any, res: Response) => {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const countTotal = Boolean(req.query.count_total);
    const order = String(req.query.order);
    const wallet_address=String(req.user.wallet_address);
    const sessions = await UserSessionHelper.UserSessionList(
      wallet_address,
      limit,
      page,
      countTotal,
      order
    );

    return sendResponse(res, sessions);
  };

}

export default UserSessionController;
