import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class PlanHelper {
    constructor() {
        (async () => {})();
      }

  public planList = async (req: Request, res: Response): Promise<ApiResponse> => {
    try {
      const {
        "pagination.limit": limitRaw,
        "pagination.offset": offsetRaw,
        "pagination.count_total": countTotalRaw,
        "pagination.reverse": reverseRaw,
      } = req.query;

      const limit = parseInt(limitRaw as string) || 10;
      const offset = parseInt(offsetRaw as string) || 0;
      const countTotal = countTotalRaw === "true";
      const reverse = reverseRaw === "true";

      const order = [["createdAt", reverse ? "DESC" : "ASC"]];

      const result = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Plan, {
        limit,
        offset,
        order,
      });

      return {
        data: {
          plans: result?.rows ?? [],
          pagination: {
            limit,
            offset,
            reverse,
            ...(countTotal && { total: result?.count ?? 0 }),
          },
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

  /**
 * Get a specific plan by its plan_id
 * @param req 
 * @param res 
 */
public getPlanById = async (req: Request, res: Response): Promise<ApiResponse> => {
    try {
      const { plan_id } = req.query;
  
      if (!plan_id) {
        return {
          error: true,
          status: 400,
          message: "plan_id is required",
        };
      }
  
      const plan = await PostgresDataHelper.findOneData(DATA_MODELS.Plan, {
        where: { id: plan_id },
      });
  
      if (!plan) {
        return {
          error: true,
          status: 404,
          message: "Plan not found",
        };
      }
  
      return {
        data: plan,
        status: 200,
        error: false,
        message: "Plan fetched successfully",
      };
    } catch (error: any) {
      return {
        error: true,
        status: 500,
        message: "Internal server error",
      };
    }
};

public getAllByPlanId = async (req: Request, res: Response): Promise<ApiResponse> => {
    try {
      const {
        plan_id,
        "pagination.limit": limitRaw,
        "pagination.offset": offsetRaw,
        "pagination.key": keyRaw,
        "pagination.count_total": countTotalRaw,
        "pagination.reverse": reverseRaw,
      } = req.query;
  
      if (!plan_id) {
        return {
          error: true,
          status: 400,
          message: "plan_id is required",
        };
      }
  

      const limit = parseInt(limitRaw as string) || 10;
      const offset = keyRaw
        ? undefined 
        : parseInt(offsetRaw as string) || 0;
      const countTotal = countTotalRaw === "true" && !keyRaw;
      const reverse = reverseRaw === "true";

      const query: any = {
        where: { plan_id },
        limit,
        order: [["createdAt", reverse ? "DESC" : "ASC"]],
      };
  
      if (offset !== undefined) {
        query.offset = offset;
      }
  
      const result = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Node, query);
  
      return {
        data: result?.rows ?? [],
        pagination: {
          limit,
          ...(offset !== undefined && { offset }),
          reverse,
          ...(countTotal && { total: result?.count ?? 0 }),
        },
        status: 200,
        error: false,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      };
  
    } catch (error: any) {
      console.error("Error in getAllByPlanId:", error);
      return {
        error: true,
        status: 500,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR
      };
    }
  };
  
  


}

export default new PlanHelper();
