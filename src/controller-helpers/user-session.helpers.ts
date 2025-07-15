import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { col, fn, literal,QueryTypes } from "sequelize";
import DBConnectionHandler from "../connection";
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

      const { rows, count } = await PostgresDataHelper.findAndCountAll(DATA_MODELS.Sessions, {
        where: {
          acc_address: wallet_address,
          status: "inactive_pending",
        },
        limit,
        offset,
        order: [["createdAt", sortOrder]],
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

 
  public UserServerList = async (
    wallet_address: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string
  ): Promise<ApiResponse> => {
    try {
      limit = limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage - 1) * limit;
      const sortOrder = order === "ASC" ? "ASC" : "DESC";
  
      const results = await sequelize.query(
        `
        SELECT 
          n.country AS country,
          COUNT(s.id) AS session_count
        FROM dvpn_db.sessions AS s
        LEFT JOIN dvpn_db.nodes AS n
          ON s.node_address = n.address
        WHERE s.acc_address = :wallet_address
        GROUP BY n.country
        ORDER BY session_count ${sortOrder}
        LIMIT :limit OFFSET :offset;
        `,
        {
          replacements: {
            wallet_address,
            limit,
            offset,
          },
          type: QueryTypes.SELECT,
        }
      );
  
      return {
        data: {
          countries: results,
          total: results.length,
        },
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
