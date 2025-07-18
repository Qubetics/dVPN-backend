import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class SessionHelper {
    constructor() {
        (async () => {})();
      }

  public sessionList = async (   
    wallet_address: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string
    ): Promise<ApiResponse> => {
      try {

      // if(sessionId!='undefined' && sessionId) {
      //   const session = await PostgresDataHelper.findOneData(DATA_MODELS.Plans, {
      //     where: { id: sessionId },
      //   });
      //   console.log("🚀 ~ PlanHelper ~ plan:", session)
    
      //   if (!session) {
      //     return {
      //       error: true,
      //       status: STATUS_CODES.UNAUTHORIZED,
      //       message: RESPONSE_MESSAGES.UNAUTHORIZED,
      //     };
      //   };
    
      //   return {
      //     data: session,
      //     status: STATUS_CODES.SUCCESS,
      //     error: false,
      //     message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      //   };
      // }

      if(wallet_address==="undefined"){
        return {
          error: true,
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        };
      }

      limit=limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage-1) * limit;
      const sortOrder = order === "ASC" ? "ASC" : "DESC";

      const {rows,count} = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Sessions, {
        where:{address:wallet_address},
        limit: limit,
        offset: offset,
        order: [["createdAt", sortOrder ]],
      });

      const responseData: any = {
        plans: rows,
      };
  
      if (countTotal === true) {
        responseData.total = count;
      }
      return {
        data: responseData,
        status: STATUS_CODES.SUCCESS,
        error: false,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      };

    } catch (error: any) {
      return {
        error: true,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      };
    }
  };


public getAllByPlanId = async (  
  planId : string,
  limit?: number,
  page?: number,
  countTotal?: boolean,
  order?: string,
  ): Promise<ApiResponse> => {
    try {
      if (!planId) {
        return {
          error: true,
          status: STATUS_CODES.BADREQUEST,
          message: RESPONSE_MESSAGES.NOT_FOUND,
        };
      }

      const plan = await PostgresDataHelper.findOneData(DATA_MODELS.Plans, {
        where: { id: planId },
      });
  
      if (!plan) {
        return {
          error: true,
          status: STATUS_CODES.NOTFOUND,
          message: RESPONSE_MESSAGES.PLAN_NOT_FOUND,
        };
      }
  
      limit = limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage-1) * limit;

      const query: any = {
        where: { planId },
        limit:limit,
        offset:offset,
        order: [["createdAt", order ? order : 'ASC' ]],
      };
  
      const {rows,count} = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Plans, query);
  
      return {
        data: {
          plans: rows ,
          total: (countTotal ? count:0)
        },
        status: STATUS_CODES.SUCCESS,
        error: false,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      };
  
    } catch (error: any) {
      console.error("Error in getAllByPlanId:", error);
      return {
        error: true,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      };
    }
  };
  
}

export default new SessionHelper();
