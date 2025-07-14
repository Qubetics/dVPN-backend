import { Request, Response } from "express";
import postgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { log } from "console";

class NodeHelper {
  constructor() {
    (async () => { })();
  }

  public nodeList = async (
    status?: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string,
    nodeAddress?: string,
    country?: string,
    city?: string
  ): Promise<ApiResponse> => {
    try {
      // Case: Fetch single node by address
      if (nodeAddress && nodeAddress !== 'undefined') {
        const node = await postgresDataHelper.findOneData(DATA_MODELS.Node, {
          where: { address: nodeAddress },
        });

        if (!node) {
          return {
            error: true,
            status: STATUS_CODES.UNAUTHORIZED,
            message: RESPONSE_MESSAGES.UNAUTHORIZED,
          };
        }

        return {
          data: node,
          status: STATUS_CODES.SUCCESS,
          error: false,
          message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
        };
      }

      // Construct dynamic where clause
      const whereClause: any = {};


      if (status && status !== "undefined" && status !== "inactive") {
        whereClause.status = status;
      } else  if (status && status !== "undefined" && status !== "active"){
        whereClause.status = "inactive";
      }

      if (country && country !== "undefined") {
        whereClause.country = country;
      }

      if (city && city !== "undefined") {
        whereClause.city = city;
      }

      // Clean order (default is DESC unless explicitly provided)
      const sortOrder = order === "ASC" ? "ASC" : "DESC";

      limit = limit || 5;
      page = page || 1;
      const offset = (page - 1) * limit;
      const { rows, count } = await postgresDataHelper.findAndCountAll(DATA_MODELS.Node, {
        where: whereClause,
        limit,
        offset,
        order: [["createdAt", sortOrder]],
      });
      // Prepare response
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

}


export default new NodeHelper();