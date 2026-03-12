import postgresDataHelper from "../helpers/postgres.data.helper";
import { API_URL_ENDPOINT, CURRENCY_VALUE, DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, SUBSCRIPTION_LIST_ATTRIBUTE, UNDEFINED } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import { successHandler } from "../success-handler/index";
import { errorHandler } from "../error-handler/index";
import Plans from "../model/plans";
import Providers from "../model/provider";
import { getCurrentTokenPrice, TOKEN_PRICE_KEY } from "./common.helpers";
import redisHelper from "../helpers/redis.helper";

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

      let ticsUsdPrice: any;
      if (process.env.NODE_ENV == 'production') {
        const redisKey = TOKEN_PRICE_KEY(CURRENCY_VALUE.TICS, CURRENCY_VALUE.USD);
        ticsUsdPrice = await redisHelper.client.get(redisKey) ?? 0;
      } else {
        const API_URL = process.env.CURRENT_TOKEN_API;
        ticsUsdPrice = await getCurrentTokenPrice(API_URL, API_URL_ENDPOINT.token_price) ?? 0;
      }


      const flatResults = await postgresDataHelper.findAndCountFromJoinModels(
        DATA_MODELS.Subscriptions,
        { wallet_address: wallet_address },
        SUBSCRIPTION_LIST_ATTRIBUTE,
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

      const subscriptions = (flatResults?.rows ?? []).map((sub: any) => {
        const subJson = typeof sub.toJSON === 'function' ? sub.toJSON() : sub;
        const price = subJson.price;
        const ticsAmount = Number(price?.quote_value) / 1e18;
        let usdPrice: any = null;
        if (ticsAmount) {
          usdPrice = ticsAmount * Number(ticsUsdPrice);
        }

        return {
          ...subJson,
          prices_in_usd: usdPrice ? Number(usdPrice.toFixed(6)) : usdPrice,
        };
      });

      return successHandler({
        data: {
          subscriptions: subscriptions,
          total: flatResults?.total ?? 0,
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
    wallet_address: string
  ): Promise<ApiResponse> => {
    try {
      if (!wallet_address || wallet_address === UNDEFINED) {
        return errorHandler({
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        });
      }

      const results = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Subscriptions,
        { wallet_address },
        SUBSCRIPTION_LIST_ATTRIBUTE,
        [
          {
            model: Plans,
            as: "plans",
            attributes: ["provider_address"],
            include: [
              {
                model: Providers,
                as: "providers",
                attributes: ["name"],
              }
            ]
          },
        ],
        {
          raw: false,
        }
      );

      let ticsUsdPrice: any;
      if (process.env.NODE_ENV == 'production') {
        const redisKey = TOKEN_PRICE_KEY(CURRENCY_VALUE.TICS, CURRENCY_VALUE.USD);
        ticsUsdPrice = await redisHelper.client.get(redisKey) ?? 0;
      } else {
        const API_URL = process.env.CURRENT_TOKEN_API;
        ticsUsdPrice = await getCurrentTokenPrice(API_URL, API_URL_ENDPOINT.token_price) ?? 0;
      }

      const currentDate = new Date();

      const normalizedResults = results.map((sub: any) => {
        const subJson = typeof sub.toJSON === 'function' ? sub.toJSON() : sub;
        const inactiveDate = new Date(subJson.inactive_at);
        const isActive = inactiveDate > currentDate;

        const price = subJson.price;
        const ticsAmount = Number(price?.quote_value) / 1e18;
        let usdPrice: any = null;
        if (ticsAmount) {
          usdPrice = ticsAmount * Number(ticsUsdPrice);
        }

        return {
          ...subJson,
          isActive,
          isRenew: false,
          prices_in_usd: usdPrice ? Number(usdPrice.toFixed(6)) : usdPrice,
        };
      });

      const providerMap: Record<string, any[]> = {};

      for (const sub of normalizedResults) {
        const providerAddress = sub.plans?.provider_address;
        if (!providerAddress) continue;

        if (!providerMap[providerAddress]) {
          providerMap[providerAddress] = [];
        }
        providerMap[providerAddress].push(sub);
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

            // Pick latest expired subscription
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

      const renewableSubscriptions = Object
        .values(providerMap)
        .flat()
        .filter(sub => sub.isRenew);

      return successHandler({
        data: {
          subscriptions: renewableSubscriptions,
          total: renewableSubscriptions.length,
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