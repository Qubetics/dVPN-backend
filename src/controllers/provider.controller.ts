import * as express from "express";
import { Controller } from "@interfaces";
import { Response } from "express";
import sendResponse from "../responses/response.helper";
import { sessionCheck } from "../middleware/sessionCheck";
import providerHelper from "../controller-helpers/provider.helper";


class ProviderController implements Controller {
   public path="/provider";
   public router=express.Router();

   constructor() {
    this.initializeRoutes();
   }

   private initializeRoutes() {
    this.router.get(`${this.path}/`,sessionCheck,this.getProviderList);
    this.router.get(`${this.path}/recent`,sessionCheck,this.getRecentProviderList);
   }

   private getProviderList=async (req:any,res:Response)=>{
    const {wallet_address}=req.user;
     const providerListResponse= await providerHelper.getProviderList(String(wallet_address));
    return sendResponse(res,providerListResponse);
   }

   private getRecentProviderList=async (req:any,res:Response)=>{
      const {wallet_address}=req.user;
      const providerListResponse= await providerHelper.getRecentProviderList(String(wallet_address));
     return sendResponse(res,providerListResponse);
   }
}

export default ProviderController;