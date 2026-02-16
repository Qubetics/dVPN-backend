import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED, ACTIVE, UNKNOWN} from "../constants/index";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import postgresDataHelper from "../helpers/postgres.data.helper";
import dbConnectionHandler from "../connection";
import Node from "../model/nodes/index";
import { log } from "../utils/helper.utils"
import { Op } from "sequelize";
require('dotenv').config();

const sequelize = dbConnectionHandler.sequelize;

class PlanHelper {

    constructor() {
        (() => { })();
    }

    public getAllPlans = async (
        providerAddress: string
    ): Promise<ApiResponse> => {
        try {
            if (!providerAddress || providerAddress === UNDEFINED) {
                return errorHandler({
                    message: "Provider is mandatory",
                    status: STATUS_CODES.BADREQUEST,
                });
            }

            const result = await postgresDataHelper.findDataFromJoinModels(
                DATA_MODELS.Plans,
                { provider_address: providerAddress }, 
                [
                    "plan_id",
                    "hours",
                    "prices",
                    [sequelize.col("nodes.country"), "country"], 
                    [sequelize.fn("COUNT", sequelize.col("nodes.id")), "node_count"], 
                    [sequelize.fn("MAX", sequelize.col("nodes.flag_url")), "flag_url"],
                ],
                [
                    {
                        model: Node,
                        as: "nodes",
                        attributes: [],
                        required: true,
                        where: {
                            node_status: ACTIVE,
                            protocol: {
                                [Op.ne]: UNKNOWN,
                            },
                        },
                    }
                ],
                {
                    raw: true,
                    group: ["plans.plan_id", "nodes.country"],
                    order: [["plan_id", "ASC"]],
                }
            );

            const mergedPlans = Object.values(
                result.reduce((acc:any, row:any) => {
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
        } catch (error: any) {
            log.red("Error in getAllPlans:", error);
            return errorHandler({
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                status: STATUS_CODES.INTERNALSERVER,
            });
        }
    };
}

export default new PlanHelper();