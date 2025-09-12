import { DATA_MODELS, NODE_LIST_ATTRIBUTES, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import postgresDataHelper from "../helpers/postgres.data.helper";
import axios from "axios";
import { Sequelize } from "sequelize";
import dbConnectionHandler from "../connection";
import Node from "../model/nodes/index";
require('dotenv').config();

const BASE_API = process.env.BASE_API_URL;
const sequelize = dbConnectionHandler.sequelize;

class PlanHelper {

    constructor() {
        (() => { })();
    }

    public getAllPlans = async (page: number, limit: number): Promise<ApiResponse> => {
        try {
            const offset = (page - 1) * limit;

            const result = await postgresDataHelper.findAndQueryData(
                DATA_MODELS.Plans,
                {
                    attributes: ["planId", "hours", "prices"],
                    order: [
                        ["planId", "ASC"],
                        ["createdAt", "DESC"] // pick latest row per planId
                    ],
                    distinct: true,
                }
            );

            const plan = result[0];

            const transformed = {
                planId: plan.planId,
                hoursInDays: Number(plan.hours) / 24,
                quoteValue: plan.prices?.[0]?.quote_value || null,
            };

            return successHandler({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PLAN_FETCH_SUCCESS,
                data: transformed,
            });

        } catch (error: any) {
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER
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