import { Request,Response } from "express";
import postgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class NodeHelper {
    constructor() {
        (async () => {})();
    }

    public nodeList = async (
        status?: string,
        limit?: number,
        page?: number,
        countTotal?: boolean,
        order?: string,
        nodeAddress?: string
    ): Promise<ApiResponse> => {
        try {
            console.log("🚀 ~ PlanHelper ~ planId:",nodeAddress);
    
          if(nodeAddress!='undefined' && nodeAddress) {
            console.log("inside the iuf")
            const plan = await postgresDataHelper.findOneData(DATA_MODELS.Node, {
              where: { address: nodeAddress },
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

          const whereClause: any = {};
      
          if (status && status !== "inactive") {
            whereClause.status = status;
          }
    
    
          limit=limit || 10;
          const offsetPage = page || 1;
          const offset = (offsetPage-1) * limit;
    
          const {rows,count} = await postgresDataHelper.findAndCountAll(DATA_MODELS.Node, {
            where: whereClause,
            limit: limit,
            offset: offset,
            // order: [["createdAt", order ? order : 'ASC' ]],
          });
    
          console.log("🚀 ~ PlanHelper ~ planList= ~ result:", rows,"rows",count,"count");
    
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
}


export default new NodeHelper();