import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class PlanHelper {
  constructor() {
    (async () => { })();
  }

  public planList = async (
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string,
    planId?: string,
  ): Promise<ApiResponse> => {
    try {

      if (planId != 'undefined' && planId) {
        const plan = await PostgresDataHelper.findOneData(DATA_MODELS.Plans, {
          where: { id: planId },
        });

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

      limit = limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage - 1) * limit;

      const { rows, count } = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Plans, {
        limit: limit,
        offset: offset,
        order: [["createdAt", order ? order : 'ASC']],
      });


      return {
        data: {
          plans: rows,
          total: (countTotal ? count : 0)
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
      const offset = (offsetPage - 1) * limit;

      const query: any = {
        where: whereClause,
        limit: limit || 10,
        offset: offset,
        order: [["createdAt", order ? order : 'ASC']],
      };

      const { rows, count } = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Plans, query);


      return {
        data: {
          plans: rows,
          total: (countTotal ? count : 0)
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

export default new PlanHelper();
