import * as express from "express";
import { Controller } from "@interfaces";
import UserHelper from "../controller-helpers/user.helpers"
import { Request, Response } from "express";
import sendResponse from "../responses/response.helper";
import userHelpers from "../controller-helpers/user.helpers";
import loginValidation from "../validations/user.validation";
import { sessionCheck } from "../middleware/sessionCheck";

class UserController implements Controller {
  public path = "/user";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post(`${this.path}/login`, loginValidation, this.connectWallet);
    this.router.get(`${this.path}/logout`, sessionCheck, this.userLogout);
    this.router.get(`${this.path}/refresh`, this.userRefresh);
  }

  /**
   * It connect the wallet of the user helps in logging/sign up and sends the cookie with the response
   * @param req
   * @param res
   * @returns
   */
  private connectWallet = async (req: Request, res: Response) => {
    const wallet_address = String(req.body.wallet_address);
    const pubKey = String(req.body.pubKey);
    const signature = req.body.signature;
    const result = await UserHelper.connectWallet(
      wallet_address,
      pubKey,
      signature,
    );
    return sendResponse(res, result);
  };

  /**
   * Handles user logout by clearing tokens and session-related data.
   * @param req 
   * @param res
   * @returns 
   */
  private userLogout = async (req: any, res: Response) => {
    const refresh_token = String(req.headers['refresh_token']);
    const logoutResponse = await userHelpers.userLogout(refresh_token);
    return sendResponse(res, logoutResponse);
  };

  /**
   * Generates new access and refresh tokens using a valid refresh token.
   * @param req
   * @param res
   * @returns
   */
  private userRefresh = async (req: any, res: Response) => {
    const refresh_token = String(req.headers['refresh_token']);
    const refreshResponse = await userHelpers.userRefresh(refresh_token);
    return sendResponse(res, refreshResponse);
  };
}

export default UserController;