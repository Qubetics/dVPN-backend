import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import DBConnectionHandler from "../connection";
import postgresDataHelper from "../helpers/postgres.data.helper";
import Node from "../model/nodes/index";
import { flattenNodeFields } from "./common.helpers";
const sequelize = DBConnectionHandler.sequelize;

class UserSessionHelper {
  constructor() {
    (async () => { })();
  }

  public UserSessionList = async (
    wallet_address: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string
  ): Promise<ApiResponse> => {
    try {

      if (!wallet_address || wallet_address === "undefined") {
        return {
          error: true,
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        };
      }

      limit = limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage - 1) * limit;
      const sortOrder = order === "ASC" ? "ASC" : "DESC";

      const results = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Sessions,
        {
          acc_address: wallet_address,
        },
        ['start_at', 'status_at', 'status'], // or specific attributes from Sessions, 
        [
          {
            model: Node,
            attributes: ['flag_url', 'city', 'country', 'remote_url', 'address'],
          },
        ],
        {
          limit,
          offset,
          order: [['createdAt', sortOrder]], // ASC or DESC
        }
      );

      const flatResults = flattenNodeFields(results);

      return {
        data: {
          sessions: flatResults ?? [],
          total: flatResults?.length ?? 0,
        },
        status: STATUS_CODES.SUCCESS,
        error: false,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      };

    } catch (error: any) {
      console.log("error", error);
      return {
        error: true,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      };
    }
  };


  public UserServerList = async (
    wallet_address: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string
  ): Promise<ApiResponse> => {
    try {
      limit = limit || 10;
      page = page || 1;
      const offset = (page - 1) * limit;
      const sortOrder = order === "ASC" ? "ASC" : "DESC";

      const results = await PostgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Sessions,
        {
          acc_address: wallet_address,
        },
        [
          [sequelize.literal('DISTINCT ON ("node"."address") "node"."address"'), 'address'],
          [sequelize.col("node.city"), "city"],
          [sequelize.col("node.country"), "country"],
        ],
        [
          {
            model: Node,
            as: "node",
            attributes: [],
            required: true,
          },
        ],
        {
          order: [
            [sequelize.literal('"node"."address"'), sortOrder],
          ],
          limit,
          offset,
          raw: true,
        }
      );

      const responseData: any = {
        nodes: results,
      };

      if (countTotal) {
        responseData.total = results.length;
      }


      return {
        data: responseData,
        status: STATUS_CODES.SUCCESS,
        error: false,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      };
    } catch (error: any) {
      console.error("UserServerList Error:", error);
      return {
        error: true,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      };
    }
  };


}

export default new UserSessionHelper();
