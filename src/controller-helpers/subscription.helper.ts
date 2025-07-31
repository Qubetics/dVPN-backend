import postgresDataHelper from "../helpers/postgres.data.helper";
import { ACTIVE, DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class SubscriptionHelper {

    constructor() {
        (async () => { })();
    }

    public getSubscritptionsList = async (
        wallet_address: string,
        limit?: number,
        page?: number,
        order?: string
    ): Promise<ApiResponse> => {
        try {

            if (!wallet_address || wallet_address === UNDEFINED) {
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


            const flatResults = await postgresDataHelper.findAndQueryData(DATA_MODELS.Subscriptions, {
                where:  { acc_address:wallet_address,status:ACTIVE },
                limit,
                offset,
                order: [["createdAt", sortOrder]],
              });

            return {
                data: {
                    subscriptions: flatResults ?? [],
                    total: flatResults?.length ?? 0,
                },
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

export default new SubscriptionHelper();