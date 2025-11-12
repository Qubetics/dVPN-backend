import postgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED, INACTIVE, ACTIVE, NODE_LIST_ATTRIBUTES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { fn, col, Sequelize } from "sequelize";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import Plans from "../model/plans/index";
import dbConnectionHandler from "../connection";
import Subscriptions from "../model/subscriptions";
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
    planId?: string,
    protocolType?: string,
    walletAddress?: string
  ): Promise<ApiResponse> => {
    try {
      if (!planId || planId === UNDEFINED) {
        return errorHandler({
          status: STATUS_CODES.BADREQUEST,
          message: "planId is required to fetch nodes"
        });
      }

      // If wallet given, verify plan purchased
      if (walletAddress) {
        const hasPlan = await postgresDataHelper.findOneData(
          DATA_MODELS.Subscriptions,
          { where: { plan_id: planId, wallet_address: walletAddress } }
        );

        if (!hasPlan) {
          return errorHandler({
            status: STATUS_CODES.BADREQUEST,
            message: "You need to buy this plan first"
          });
        }
      }

      if (nodeAddress && nodeAddress !== UNDEFINED) {
        const node = await postgresDataHelper.findOneData(DATA_MODELS.Node, {
          where: { address: nodeAddress, node_status: ACTIVE, plan_id: planId },
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


      // Case : Country NOT provided & City NOT provided → show country list
      if ((!country || country === UNDEFINED) && (!city || city === UNDEFINED)) {

        const where: any = { node_status: ACTIVE };

        // Filter by plan directly from nodes table
        if (planId) {
          where.plan_id = String(planId);
        }

        if (protocolType != UNDEFINED && protocolType != 'all') {
          where.protocol = protocolType;
        }
        const countries = await postgresDataHelper.findGroupedData(
          DATA_MODELS.Node,
          where,
          [
            "country",
            [fn("COUNT", col("country")), "node_count"],
            [fn("MIN", col("flag_url")), "flag_url"]
          ],
          "country"
        );
        console.log("🚀 ~ NodeHelper ~ countries:", countries);

        return successHandler({
          data: { countries },
          status: STATUS_CODES.SUCCESS,
          message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
        });
      }


      // Case : Country exists but no city → list cities
      if (country && country !== UNDEFINED && (!city || city === UNDEFINED)) {

        //  Build WHERE clause
        const where: any = {
          country,
          node_status: ACTIVE,
        };

        // Filter by plan directly on Node table (no join needed)
        if (planId) {
          where.plan_id = String(planId);
        }

        if (protocolType != UNDEFINED && protocolType != 'all') {
          where.protocol = protocolType;
        }

        // Define attributes for grouping by city
        const attributes = [
          "city",
          [fn("COUNT", col("city")), "node_count"],
          [fn("MIN", col("flag_url")), "flag_url"],
        ];

        // Fetch data directly from Node table
        const cities = await postgresDataHelper.findGroupedData(
          DATA_MODELS.Node,
          where,
          attributes,
          "city"
        );

        // Handle optional flag_url (from first record)
        const flag_url = cities[0]?.flag_url || null;

        // Success response
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


      // Case : Country + City provided → return nodes list
      const whereClause: any = { node_status: ACTIVE };

      if (country && country !== UNDEFINED) whereClause.country = country;
      if (city && city !== UNDEFINED) whereClause.city = city;

      // Filter directly by planId (no join needed)
      if (planId) whereClause.plan_id = String(planId);

      if (protocolType != UNDEFINED && protocolType != 'all') {
        whereClause.protocol = protocolType;
      }

      // Pagination & Sorting
      const sortOrder = order === "ASC" ? "ASC" : "DESC";
      limit = limit || 5;
      page = page || 1;
      const offset = (page - 1) * limit;

      // Fetch directly from Node table
      const nodes = await postgresDataHelper.findAndQueryData(DATA_MODELS.Node, {
        where: whereClause,
        attributes: NODE_LIST_ATTRIBUTES,
        limit,
        offset,
        order: [["address", sortOrder]],
      });

      // Success Response
      return successHandler({
        data: { nodes },
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
      });
    } catch (error) {
      console.error(error);
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      });
    }
  };

  /**
   * Fetch the details of the single random node
   */
  public getRandomNode = async (walletAddress: string,protocol:string): Promise<ApiResponse> => {
    try {
      if (!walletAddress || walletAddress === UNDEFINED) {
        return errorHandler({
          status: STATUS_CODES.BADREQUEST,
          message: "Wallet address is required"
        });
      }

      let whereClause : any= { node_status: ACTIVE };

      if(protocol!==UNDEFINED && protocol!=="all"){
         whereClause={...whereClause,protocol:protocol};
      }

      // Find user purchased plans
      const result = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Node, // Base model
        whereClause, // Filter for active nodes
        [
          "id",
          "address",
          "remote_url",
          "plan_id",
          "country",
          "city",
          "node_status",
          "flag_url",
          "protocol"
        ],
        [
          {
            model: Subscriptions,
            as: "subscriptions",
            attributes: ["wallet_address", "plan_id", "status", "start_at", "inactive_at"],
            where: {
              wallet_address: walletAddress,
              status: ACTIVE, // only active subscriptions
            },
            required: true, // ensures nodes only from user’s subscribed plans are returned
          },
        ],
        {
          raw: false,
          order: [["country", "ASC"]],
        }
      );

      if (!result || result.length === 0) {
        return errorHandler({
          status: STATUS_CODES.NOTFOUND,
          message: "No nodes found for this wallet address",
        });
      }

      const nodeData = result?.[0] || null;

      return successHandler({
        data: nodeData,
        status: STATUS_CODES.SUCCESS,
        message: "Random node fetched successfully",
      });

    } catch (error: any) {
      console.error(error);
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      });
    }
  };

}


export default new NodeHelper();