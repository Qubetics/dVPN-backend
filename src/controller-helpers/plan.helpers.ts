import { DATA_MODELS, NODE_LIST_ATTRIBUTES, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import postgresDataHelper from "../helpers/postgres.data.helper";
import axios from "axios";
import { Sequelize } from "sequelize";
import dbConnectionHandler from "../connection";
import Node from "../model/nodes/index";
import Subscriptions from "../model/subscriptions/index";
import Plans from "../model/plans/index";
require('dotenv').config();

const BASE_API = process.env.BASE_API_URL;
const sequelize = dbConnectionHandler.sequelize;

class PlanHelper {

    constructor() {
        (() => { })();
    }

    public getAllPlans = async (
        providerAddress: string,
        country: string
    ): Promise<ApiResponse> => {
        try {
            if (!providerAddress || providerAddress === UNDEFINED) {
                return errorHandler({
                    message: "Provider is mandatory",
                    status: STATUS_CODES.BADREQUEST,
                });
            }
    
            if (!country || country === UNDEFINED) {
                return errorHandler({
                    message: "Country is mandatory",
                    status: STATUS_CODES.BADREQUEST,
                });
            }
    
            /** STEP 1 — Get plan_ids that have AT LEAST ONE node in given country */
            const plansWithCountry = await postgresDataHelper.findDataFromJoinModels(
                DATA_MODELS.Plans,
                { provider_address: providerAddress },
                ["plan_id"],
                [
                    {
                        model: Node,
                        as: "nodes",
                        attributes: [],
                        required: true,
                        where: { country }
                    }
                ],
                { raw: true, group: ["plans.plan_id"] }
            );
    
            const planIds = plansWithCountry.map((p: any) => p.plan_id);
    
            if (planIds.length === 0) {
                return successHandler({
                    status: 200,
                    message: "No plans found for this country",
                    data: [],
                });
            }
    
            /** STEP 2 — Get ALL countries for ONLY those plan_ids */
            const result = await postgresDataHelper.findDataFromJoinModels(
                DATA_MODELS.Plans,
                {
                    provider_address: providerAddress,
                    plan_id: planIds
                },
                [
                    "plan_id",
                    "hours",
                    "prices",
                    [sequelize.col("nodes.country"), "country"],
                    [sequelize.fn("COUNT", sequelize.col("nodes.id")), "node_count"],
                    [sequelize.fn("MAX", sequelize.col("nodes.flag_url")), "flag_url"]
                ],
                [
                    {
                        model: Node,
                        as: "nodes",
                        attributes: [],
                        required: false
                    }
                ],
                {
                    raw: true,
                    group: ["plans.plan_id", "nodes.country"],
                    order: [["plan_id", "ASC"]]
                }
            );
    
            /** MERGE */
            const mergedPlans = Object.values(
                result.reduce((acc: any, row: any) => {
                    const { plan_id, hours, prices, country, node_count, flag_url } = row;
    
                    if (!acc[plan_id]) {
                        acc[plan_id] = {
                            plan_id,
                            hours,
                            prices,
                            countries: []
                        };
                    }
    
                    if (country) {
                        acc[plan_id].countries.push({
                            country,
                            node_count,
                            flag_url
                        });
                    }
    
                    return acc;
                }, {})
            );
    
            return successHandler({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PLAN_FETCH_SUCCESS,
                data: mergedPlans,
            });
    
        } catch (error) {
            console.error("Error in getAllPlans:", error);
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER,
            });
        }
    };    

    public getAllNodeForPlan = async (walletAddress: string, page: number, limit: number): Promise<ApiResponse> => {
        try {

            const offset = (page - 1) * limit;

            const planPurchase = await postgresDataHelper.findOneData(
                DATA_MODELS.PlanPurchase,
                { where: { wallet_address: walletAddress }, attributes: ["planId"] }
            );

            if (!planPurchase) {
                return errorHandler({
                    status: STATUS_CODES.NOTFOUND,
                    message: RESPONSE_MESSAGES.PLAN_NOT_FOUND,
                    data: [],
                });
            }

            const include = [
                {
                    model: Node,
                    as: "node", // alias must match the association in your models
                    attributes: NODE_LIST_ATTRIBUTES,
                },
            ];

            const planId = planPurchase.planId;

            const result = await postgresDataHelper.findDataFromJoinModels(
                DATA_MODELS.Plans,            // Main model: Plans
                { planId },                   // WHERE clause
                ["planId", "nodeAddress"],    // Columns from Plans table
                include,                      // Join with Node table
                { raw: false }                // Set raw=false to get nested objects
            );

            if (!result || result.length === 0) {
                return errorHandler({
                    status: STATUS_CODES.NOTFOUND,
                    message: RESPONSE_MESSAGES.NO_NODE_FOUND,
                });
            }

            // Extract node details from the joined result
            const nodeDetails = result.map((plan: any) => plan.node);

            return successHandler({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.NODE_DETAIL_FOUND,
                data: nodeDetails,
            });


        } catch (error: any) {
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            });
        }
    };

    public postForPlanId = async (walletAddress: string, TxHash: string) => {
        try {
            const { data } = await axios.get(
                `${BASE_API}/cosmos/tx/v1beta1/txs/${TxHash}`,
                { headers: { accept: "application/json" } }
            );

            // 2️⃣ Validate tx_response.code
            if (!data?.tx_response || data.tx_response.code !== 0) {
                return {
                    status: STATUS_CODES.BADREQUEST,
                    message: RESPONSE_MESSAGES.FAILED_TRANSACTION,
                };
            }

            // 3️⃣ Extract plan ID
            const messages = data?.tx?.body?.messages || [];
            if (messages.length === 0) {
                return {
                    status: STATUS_CODES.BADREQUEST,
                    message: RESPONSE_MESSAGES.NO_MESSAGE,
                };
            }

            const message = messages[0];
            const planId = message?.id; // In your payload, "id" = planId
            if (!planId) {
                return {
                    status: STATUS_CODES.BADREQUEST,
                    message: RESPONSE_MESSAGES.PLAN_ID_NOT_FOUND
                };
            }

            // 4️⃣ Save to PlanPurchase table
            const savedPurchase = await postgresDataHelper.saveData(
                DATA_MODELS.PlanPurchase,
                {
                    wallet_address: walletAddress,
                    planId: planId,
                }
            );

            return {
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PLAN_ID_SUCCESS,
                data: savedPurchase,
            };
        } catch (error) {
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            })
        }
    };

    public getPlanId = async (walletAddress: string) => {
        try {

            const result = await postgresDataHelper.findOneData(
                DATA_MODELS.PlanPurchase,
                {
                    where: { wallet_address: walletAddress },
                    order: [["createdAt", "DESC"]], // get the most recent purchase
                }
            );

            return successHandler({
                message: RESPONSE_MESSAGES.PLAN_ID_FETCH,
                status: STATUS_CODES.SUCCESS,
                data: result
            })
        } catch (error) {
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
            })
        }
    };
}

export default new PlanHelper();