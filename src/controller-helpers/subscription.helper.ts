import postgresDataHelper from "../helpers/postgres.data.helper";
import { ACTIVE, DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import Plans from "../model/plans";
import Providers from "../model/provider";

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
        return errorHandler({
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        });
      }

      limit = limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage - 1) * limit;
      const sortOrder = order === "ASC" ? "ASC" : "DESC";


      const flatResults = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Subscriptions,
        { wallet_address: wallet_address },
        [
          "id",
          "wallet_address",
          "plan_id",
          "price",
          "renewal_price_policy",
          "status",
          "inactive_at",
          "start_at",
        ],
        [
          {
            model: Plans,
            as: "plans",
            attributes: [
              "provider_address",
            ],
            include: [
              {
                model: Providers,
                as: "providers",
                attributes: [
                  "name",
                ],
              }
            ]
          },
        ],
        {
          limit,
          offset,
          order: [["createdAt", sortOrder]],
          raw: false,
        }
      );

      return successHandler({
        data: {
          subscriptions: flatResults ?? [],
          total: flatResults?.length ?? 0,
        },
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
      });
    } catch (error: any) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER
      });
    }
  };

  public getRenewSubscriptions = async (
    wallet_address: string,
    limit?: number,
    page?: number,
    order?: string
  ): Promise<ApiResponse> => {
    try {

      if (!wallet_address || wallet_address === UNDEFINED) {
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
        DATA_MODELS.Subscriptions,
        { wallet_address: wallet_address },
        [
          "id",
          "wallet_address",
          "plan_id",
          "price",
          "renewal_price_policy",
          "status",
          "inactive_at",
          "start_at",
        ],
        [
          {
            model: Plans,
            as: "plans",
            attributes: [
              "provider_address",
            ],
            include: [
              {
                model: Providers,
                as: "providers",
                attributes: [
                  "name",
                ],
              }
            ]
          },
        ],
        {
          limit,
          offset,
          order: [["createdAt", sortOrder]],
          raw: false,
        }
      );

      const currentDate = new Date();

      const normalizedResults = results.map((sub: any) => {
        const inactiveDate = new Date(sub.inactive_at);
        const isActive = inactiveDate > currentDate;

        return {
          ...sub.toJSON(),
          isActive,
          isRenew: false,
        };
      });

      const providerMap: Record<string, any[]> = {};

      for (const sub of normalizedResults) {
        if (!providerMap[sub.plans?.provider_address]) {
          providerMap[sub.plans?.provider_address] = [];
        }
        providerMap[sub.plans?.provider_address].push(sub);
      }

      for (const provider in providerMap) {
        const providerSubs = providerMap[provider];

        const activeSubExists = providerSubs.some(sub => sub.isActive);

        if (activeSubExists) {
          providerSubs.forEach(sub => {
            sub.isRenew = false;
          });
        } else {
          const planMap: Record<string, any[]> = {};

          for (const sub of providerSubs) {
            if (!planMap[sub.plan_id]) {
              planMap[sub.plan_id] = [];
            }
            planMap[sub.plan_id].push(sub);
          }

          for (const planId in planMap) {
            const planSubs = planMap[planId];

            // Pick latest expired
            planSubs.sort(
              (a, b) =>
                new Date(b.inactive_at).getTime() -
                new Date(a.inactive_at).getTime()
            );

            planSubs.forEach((sub, index) => {
              sub.isRenew = index === 0;
            });
          }
        }
      }

      const allSubscriptions = Object.values(providerMap).flat();

      const flatResults = allSubscriptions.filter(sub => sub.isRenew === true);

      return successHandler({
        data: {
          subscriptions: flatResults ?? [],
          total: flatResults?.length ?? 0,
        },
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
      });
    } catch (error: any) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER
      });
    }
  };

}

export default new SubscriptionHelper();