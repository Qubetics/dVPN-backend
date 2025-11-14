import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import { errorHandler } from "../error-handler/index";
import { successHandler } from "../success-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import postgresDataHelper from "../helpers/postgres.data.helper";
import Plans from "../model/plans/index";
import Subscriptions from "../model/subscriptions/index";
import Node from "../model/nodes/index"

class ProviderHelper {

  constructor() {
    (() => { })();
  }

  public getProviderList = async (walletAddress: string,subscribed: boolean): Promise<ApiResponse> => {
    try {
      if (!walletAddress || walletAddress === UNDEFINED) {
        return errorHandler({
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
      }

      // Fetch Providers with Plans → Nodes → Subscriptions
      const providerData = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Providers,
        {},
        ["name","address", "identity", "website"], // Provider attributes
        [
          {
            model: Plans,
            as: "plans",
            attributes: ["plan_id", "hours", "gigabytes"],
            include: [
              {
                model: Subscriptions,
                as: "subscriptions",
                attributes: ["wallet_address", "status", "start_at"],
              },
              {
                model: Node,
                as: "nodes",
                attributes: ["country"], // We'll use this to count countries
              },
            ],
          },
        ],
        { raw: false }
      );

      // Transform data
      const providerListData = providerData
      .map((provider: any) => {
        const plans = provider.plans || [];
    
        const subscribedPlans =
          plans
            .filter((plan: any) =>
              plan.subscriptions?.some(
                (sub: any) => sub.wallet_address === walletAddress
              )
            )
            .map((plan: any) => plan.plan_id) ?? [];
    
        const isUserSubscribed = subscribedPlans.length > 0;
    
        const allCountries = plans.flatMap(
          (plan: any) => plan.nodes?.map((n: any) => n.country) || []
        );
        const uniqueCountries = [...new Set(allCountries)];
        const countryCount = uniqueCountries.length;
    
        if (subscribed) {
          if (!isUserSubscribed) return null; 
          return {
            name: provider.name,
            address: provider.address,
            identity: provider.identity,
            website: provider.website,
            isUserSubscribed,
            subscribedPlanIds: subscribedPlans,
            countryCount,
          };
        }
    
        return {
          name: provider.name,
          address: provider.address,
          identity: provider.identity,
          website: provider.website,
          isUserSubscribed,
          ...(isUserSubscribed && { subscribedPlanIds: subscribedPlans }),
          countryCount,
        };
      })
      .filter(Boolean);  
    

      return successHandler({
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
        data: providerListData,
      });
    } catch (error: any) {
      console.error("Error in getProviderList:", error);
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER,
      });
    }
  };

  public getRecentProviderList = async (walletAddress: string): Promise<ApiResponse> => {
    try {
      if (!walletAddress || walletAddress === "undefined") {
        return errorHandler({
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        });
      }
      const providerRecentListData = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Providers,
        {},
        ["name","address", "identity", "website"],
        [
          {
            model: Plans,
            as: "plans",
            attributes: ["plan_id"],
            include: [
              {
                model: Subscriptions,
                as: "subscriptions",
                attributes: ["wallet_address", "status", "start_at"],
                where: {
                  wallet_address: walletAddress,
                },
                required: true,
              },
            ],
            required: true,
          },
        ],
        { raw: false }
      );

      const formattedData = providerRecentListData.map((provider : any) => {
        const subscribedPlanIds = provider.plans
          ?.filter((plan:any) => plan.subscriptions && plan.subscriptions.length > 0)
          .map((plan:any) => plan.plan_id) || [];
      
        return {
          name: provider.name,
          address: provider.address,
          identity: provider.identity,
          website: provider.website,
          isUserSubscribed: subscribedPlanIds.length > 0,
          ...(subscribedPlanIds.length > 0 && { subscribedPlanIds }),
        };
      });

      return successHandler({
        status: STATUS_CODES.SUCCESS,
        message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
        data: formattedData
      });

    } catch (error) {
      return errorHandler({
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        status: STATUS_CODES.INTERNALSERVER
      });
    }
  };

}

export default new ProviderHelper();