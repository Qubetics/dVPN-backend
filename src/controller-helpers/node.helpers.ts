import postgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED, INACTIVE, ACTIVE, NODE_LIST_ATTRIBUTES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { fn, col, Sequelize } from "sequelize";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import Plans from "../model/plans/index";
import dbConnectionHandler from "../connection";
const sequelize = dbConnectionHandler.sequelize;

class NodeHelper {

  constructor() {
    (async () => { })();
  }
  /**
 * Fetches a list of nodes or metadata about nodes based on the provided filters.
 * 
 * @param {string} status 
 * @param {number} limit 
 * @param {number} page 
 * @param {boolean} countTotal 
 * @param {string} order 
 * @param {string} nodeAddress 
 * @param {string} country 
 * @param {string} city 
 * @returns ApiResponse containing the relevant node(s) or metadata
 */
  public nodeList = async (
    status?: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string,
    nodeAddress?: string,
    country?: string,
    city?: string,
    planId?: number
  ): Promise<ApiResponse> => {
    try {
      //  Case : when to fetch a single node by address
      if (nodeAddress && nodeAddress !== UNDEFINED) {
        const node = await postgresDataHelper.findOneData(DATA_MODELS.Node, {
          where: { address: nodeAddress },
        });

        if (!node) {
          return errorHandler({
            status: STATUS_CODES.BADREQUEST,
            message: RESPONSE_MESSAGES.UNAUTHORIZED
          });
        }

        return successHandler({
          data: node,
          status: STATUS_CODES.SUCCESS,
          message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
        });

      }

      //  Case : No country & no city and it return list of countries with node count
      if ((!country || country === UNDEFINED) && (!city || city === UNDEFINED)) {
        let where: any;
        if (planId) {
          where = { status: ACTIVE };
        }
        const countries = await postgresDataHelper.findAndQueryData(DATA_MODELS.Node, {
          attributes: [
            "country",
            [fn("COUNT", col("country")), "node_count"],
            [fn("MIN", col("flag_url")), "flag_url"],
          ],
          where,
          group: ["country"],
          raw: true,
        });

        return successHandler({
          data: { countries },
          status: STATUS_CODES.SUCCESS,
          message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
        })
      }

      // Case : Country exists but no city and it return cities with node count
      if (country && country !== UNDEFINED && (!city || city === UNDEFINED)) {
        let where: any;
        if (planId) {
          where = { status: ACTIVE };
        }
        const cities = await postgresDataHelper.findAndQueryData(DATA_MODELS.Node, {
          attributes: [
            "city",
            [fn("COUNT", col("city")), "node_count"],
            [fn("MIN", col("flag_url")), "flag_url"],
          ],
          where: { country },
          group: ["city"],
          raw: true,
        });

        const flag_url = cities[0]?.flag_url || null;

        return successHandler({
          data: {
            country,
            flag_url,
            cities: cities.map(({ city, node_count }) => ({
              city,
              node_count,
            })),
          },
          status: STATUS_CODES.SUCCESS,
          message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
        });
      }

      // Case : Country and City both provided and it return list of nodes
      const whereClause: any = {};

      if (status && status !== UNDEFINED && status !== INACTIVE) {
        whereClause.status = status;
      } else if (status && status !== UNDEFINED && status !== ACTIVE) {
        whereClause.status = INACTIVE;
      } else {
        whereClause.status = ACTIVE;
      }

      if (country && country !== UNDEFINED) {
        whereClause.country = country;
      }

      if (city && city !== UNDEFINED) {
        whereClause.city = city;
      }

      const sortOrder = order === "ASC" ? "ASC" : "DESC";
      limit = limit || 5; // 5 is default
      page = page || 1;
      const offset = (page - 1) * limit;

      const include: any[] = [];
      if (planId) {
        include.push({
          model: Plans,
          attributes: ["planId"],
        });
      }

      const result = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Node,
        whereClause,
        NODE_LIST_ATTRIBUTES,
        include,
        {
          limit,
          offset,
          order: [['address', 'ASC']],
          raw: false,
        }
      );

      const responseData: any = {
        nodes: result,
      };

      if (countTotal === true) {
        responseData.total = result;
      }

      return successHandler({
        data: responseData,
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      });
    } catch (error: any) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      });
    }
  };
  /**
   * Fetch the details of the single random node
   */
  public getRandomNode = async (): Promise<ApiResponse> => {
    try {
      const result = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Node,
        { status: ACTIVE }, // or use a dynamic whereClause
        NODE_LIST_ATTRIBUTES,
        [
          {
            model: Plans,
            attributes: ['planId'],
            required: true,
          },
        ],
        {
          limit: 1,
          order: [Sequelize.literal('RANDOM()')],
          raw: false,
        }
      );

      const nodeData = result?.[0] || null;

      if (!nodeData) {
        return errorHandler({
          status: STATUS_CODES.NOTFOUND,
          message: RESPONSE_MESSAGES.NODE_NOT_FOUND,
        });
      }

      return successHandler({ data: nodeData, status: STATUS_CODES.SUCCESS, message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS, });

    } catch (error: any) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      });
    }
  };

}


export default new NodeHelper();