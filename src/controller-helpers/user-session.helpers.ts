
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, NODE_ATTRIBUTES, RESPONSE_MESSAGES, SESSION_ATTRIBUTES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import DBConnectionHandler from "../connection";
import postgresDataHelper from "../helpers/postgres.data.helper";
import Node from "../model/nodes/index";
import { flattenNodeFields } from "./common.helpers";
import { errorHandler } from "../error-handler/index";
import { successHandler } from "../success-handler/index";

const sequelize = DBConnectionHandler.sequelize;

class UserSessionHelper {

  constructor() {
    (async () => { })();
  }

  /**
   * Fetches a paginated list of user sessions joined with node information.
   * @param {string} wallet_address 
   * @param {number} limit 
   * @param {number} page 
   * @param {boolean} countTotal 
   * @param {string} order 
   * @returns 
   */

  public UserSessionList = async (
    wallet_address: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string
  ): Promise<ApiResponse> => {
    try {

      if (!wallet_address || wallet_address === "undefined") {
        return errorHandler({
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        });
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
        SESSION_ATTRIBUTES, // or specific attributes from Sessions, 
        [
          {
            model: Node,
            as: 'nodes',
            attributes: NODE_ATTRIBUTES,
          },
        ],
        {
          limit,
          offset,
          order: [['createdAt', sortOrder]], // ASC or DESC
        }
      );
      console.log("🚀 ~ UserSessionHelper ~ results:", results)

      const flatResults = flattenNodeFields(results);

      return successHandler({
        data: {
          sessions: flatResults ?? [],
          total: flatResults?.length ?? 0,
        },
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      });
    } catch (error: any) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER
      });
    }
  };

  /**
   * Retrieves a distinct list of nodes (servers) that a user has connected to in past sessions.
   * @param {string} wallet_address 
   * @param {number} limit 
   * @param {number} page 
   * @param {boolean} countTotal 
   * @param {string} order 
   * @returns
   */
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
          [sequelize.literal('DISTINCT ON ("nodes"."address") "nodes"."address"'), 'address'],
          [sequelize.col("nodes.city"), "city"],
          [sequelize.col("nodes.country"), "country"],
        ],
        [
          {
            model: Node,
            as: "nodes",
            attributes: [],
            required: true,
          },
        ],
        {
          order: [
            [sequelize.literal('"nodes"."address"'), sortOrder],
          ],
          limit,
          offset,
          raw: true,
        }
      );
      console.log("🚀 ~ UserSessionHelper ~ results:", results)

      const responseData: any = {
        nodes: results,
      };

      if (countTotal) {
        responseData.total = results.length;
      }

      return successHandler({ data: responseData, status: STATUS_CODES.SUCCESS, message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS });
    } catch (error: any) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER
      });
    }
  };

}

export default new UserSessionHelper();
