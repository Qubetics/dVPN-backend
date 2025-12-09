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
    this.router.get(`${this.path}/country`,sessionCheck,this.getCountryProviderList);
   }

   private getProviderList=async (req:any,res:Response)=>{
    const {wallet_address}=req.user;
    const isUserSubscribed = req.query.isUserSubscribed === "true" || req.query.isUserSubscribed === "1";
     const providerListResponse= await providerHelper.getProviderList(String(wallet_address),isUserSubscribed);
    return sendResponse(res,providerListResponse);
   }

   private getRecentProviderList=async (req:any,res:Response)=>{
      const {wallet_address}=req.user;
      const providerListResponse= await providerHelper.getRecentProviderList(String(wallet_address));
     return sendResponse(res,providerListResponse);
   }

   private getCountryProviderList = async (req:any,res:Response)=>{
      const {wallet_address}=req.user;
      const country = String(req.query?.country);
      const countryProviderListResponse= await providerHelper.getCountryProviderList(String(wallet_address),country);
     return sendResponse(res,countryProviderListResponse);
   }
}

export default ProviderController;