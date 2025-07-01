import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class PlanHelper {
    constructor() {
        (async () => {})();
      }

  public planList = async (   
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string,
    planId?: string,
    ): Promise<ApiResponse> => {
      try {
        console.log("🚀 ~ PlanHelper ~ planId:",planId);

      if(planId!='undefined' && planId) {
        console.log("inside the iuf")
        const plan = await PostgresDataHelper.findOneData(DATA_MODELS.Plans, {
          where: { id: planId },
        });
        console.log("🚀 ~ PlanHelper ~ plan:", plan)
    
        if (!plan) {
          return {
            error: true,
            status: STATUS_CODES.UNAUTHORIZED,
            message: RESPONSE_MESSAGES.UNAUTHORIZED,
          };
        };
    
        return {
          data: plan,
          status: STATUS_CODES.SUCCESS,
          error: false,
          message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
        };
      }

      limit=limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage-1) * limit;
      console.log("🚀 ~ PlanHelper ~ limit:", limit)
      console.log("🚀 ~ PlanHelper ~ offset:", typeof offsetPage);
      console.log("🚀 ~ PlanHelper ~ offset:", offsetPage);
      console.log("🚀 ~ PlanHelper ~ offset:", typeof offset);
      console.log("🚀 ~ PlanHelper ~ offset:", offset);

      const {rows,count} = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Plans, {
        limit: limit,
        offset: offset,
        order: [["createdAt", order ? order : 'ASC' ]],
      });

      // console.log("🚀 ~ PlanHelper ~ planList= ~ result:", rows,"rows",count,"count");

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
      return {
        error: true,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      };
    }
  };

  public getPlansByProviderAddress = async (  
  providerAddress: string,
  status?: string, 
  limit?: number,
  page?: number,
  countTotal?: boolean,
  order?: string
  ): Promise<ApiResponse> => {
    try {
      if (!providerAddress) {
        return {
          error: true,
          status: STATUS_CODES.BADREQUEST,
          message: RESPONSE_MESSAGES.PROVIDER_ADDRESS_NOT_FOUND,
        };
      }

      const whereClause: any = {
        providerAddress,
      };
  
      if (status && status !== "inactive") {
        whereClause.status = status;
      }

      const offsetPage = page || 1;
      const offset = (offsetPage-1) * limit;
  
      const query: any = {
        where: whereClause,
        limit: limit || 10,
        offset: offset,
        order: [["createdAt",  order ? order : 'ASC' ]],
      };
  
      const { rows, count } = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Plans, query);

  
      console.log("🚀 ~ PlanHelper ~ rows,count:", rows,count)
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

export default new PlanHelper();
