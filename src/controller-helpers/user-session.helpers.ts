import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import DBConnectionHandler from "../connection";
import postgresDataHelper from "../helpers/postgres.data.helper";
import Node from "../model/nodes/index";
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

      // const results = await sequelize.query(
      //   `
      //   SELECT 
      //    n.flag_url,
      //    n.city,
      //    n.country,
      //    n.remote_url,
      //    n.address,
      //    s.start_at,
      //    s.status_at,
      //    s.status
      //   FROM dvpn_db.sessions AS s
      //   LEFT JOIN dvpn_db.nodes AS n
      //     ON s.node_address = n.address
      //   WHERE s.acc_address = :wallet_address
      //   ORDER BY s."createdAt" ${sortOrder}
      //   LIMIT :limit OFFSET :offset;
      //   `,
      //   {
      //     replacements: {
      //       wallet_address,
      //       limit,
      //       offset,
      //     },
      //     type: QueryTypes.SELECT,
      //   }
      // );

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
      

      return {
        data: {
          sessions: results,
          total: results.length
        },
        status: STATUS_CODES.SUCCESS,
        error: false,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      };

    } catch (error: any) {
      console.log("error",error);
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

      // const results = await sequelize.query(
      //   `
      //   SELECT 
      //     n.country AS country,
      //     COUNT(DISTINCT n.address) AS location
      //   FROM dvpn_db.sessions AS s
      //   LEFT JOIN dvpn_db.nodes AS n
      //     ON s.node_address = n.address
      //   WHERE s.acc_address = :wallet_address
      //   GROUP BY n.country
      //   ORDER BY location ${sortOrder}
      //   LIMIT :limit OFFSET :offset;
      //   `,
      //   {
      //     replacements: {
      //       wallet_address,
      //       limit,
      //       offset,
      //     },
      //     type: QueryTypes.SELECT,
      //   }
      // );

      const results = await PostgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Sessions,
        {
          acc_address: wallet_address,
        },
        [
          [sequelize.col('node.country'), 'country'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('node.address'))), 'location']
        ],
       [
          {
            model: Node,
            attributes: [], // we only want to group by country and count address
          }
        ],{
        group: ['node.country'],
        order: [[sequelize.literal('location'), sortOrder]], 
        limit,
        offset,
        raw: true,
        }
      );
      

      return {
        data: {
          countries: results,
          total: results?.length,
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
