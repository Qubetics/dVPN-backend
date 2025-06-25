import * as express from "express";
import { Controller } from "@interfaces";
import UserHelper from "../controller-helpers/user.helpers"
import { Request,Response } from "express";
import sendResponse from "../responses/response.helper";
import userHelpers from "../controller-helpers/user.helpers";
import loginValidation from "../validations/user.validation";

class UserController implements Controller {
    public path="/user";
    public router=express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes=()=>{
        this.router.post(`${this.path}/login`,loginValidation,this.connectWallet);
        this.router.get(`${this.path}/logout`,this.userLogout);
        this.router.get(`${this.path}/refresh`,this.userRefresh);
    }

    /**
     * It connect the wallet of the user helps in logging/sign up
     * and sends the cookie with the response
     * @param req
     * @param response
     * @returns
     */
    private connectWallet=async (req:Request ,res:Response)=>{
        const wallet_address=req.body.wallet_address;
        const pubKey=req.body.pubKey; 
        const signature=req.body.signature;
        const userData=await UserHelper.connectWallet(
            wallet_address,
            pubKey,
            signature,
        );
        return sendResponse(res, userData);
    };

  /**
   * It handles the user logout helper
   * @param req
   * @param res
   * @returns
   */
  private userLogout = async (req: Request, res: Response) => {
    const refresh_token = req.headers['refresh_token'];
    const check = await userHelpers.userLogout(refresh_token, res);
    return sendResponse(res, check);
  };

  private userRefresh = async (req: Request, res: Response) => {
    const refresh_token = req.headers['refresh_token'];
    const check = await userHelpers.userRefresh(refresh_token, res);
    return sendResponse(res, check);
  };
}

export default UserController;