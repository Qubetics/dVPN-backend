import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import { errorHandler } from "../error-handler/index";
import { successHandler } from "../success-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import postgresDataHelper from "../helpers/postgres.data.helper";
import Plans  from "../model/plans/index";
import Subscriptions  from "../model/subscriptions/index";

class ProviderHelper {

    constructor() {
        (() => { })();
    }

    public getProviderList = async (walletAddress: string): Promise<ApiResponse> => {
      try {
        if (!walletAddress || walletAddress === UNDEFINED) {
          return errorHandler({
            status: STATUS_CODES.UNAUTHORIZED,
            message: RESPONSE_MESSAGES.UNAUTHORIZED,
          });
        }
    
        const providerData = await postgresDataHelper.findDataFromJoinModels(
          DATA_MODELS.Providers,
          {},
          ["address", "identity", "website"], // Provider attributes
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
              ],
            },
          ],
          { raw: false } // Keep nested relations
        );
    
        console.log("🚀 ~ ProviderHelper ~ providerData:", providerData);
    
        // Map and format provider list
        const providerListData = providerData.map((provider: any) => {
          const subscribedPlans =
            provider.plans
              ?.filter((plan: any) =>
                plan.subscriptions?.some(
                  (sub: any) => sub.wallet_address === walletAddress
                )
              )
              ?.map((plan: any) => plan.plan_id) ?? [];
    
          const isUserSubscribed = subscribedPlans.length > 0;
    
          return {
            address: provider.address,
            identity: provider.identity,
            website: provider.website,
            isUserSubscribed,
            ...(isUserSubscribed && { subscribedPlanIds: subscribedPlans }), // Only include if subscribed
          };
        });
    
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
          ["address", "identity", "website"], 
          [
            {
              model: Plans,
              as: "plans",
              attributes: ["plan_id"],
              include: [
                {
                  model: Subscriptions,
                  as: "subscriptions",
                  attributes: [],
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
        console.log("🚀 ~ ProviderHelper ~ providerRecentListData:", providerRecentListData)

        return successHandler({
          status:STATUS_CODES.SUCCESS,
          message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
          data:providerRecentListData
        });
        
      } catch (error){
        console.log(error,"   error");
        return errorHandler({
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          status: STATUS_CODES.INTERNALSERVER
      });
      }
    };

}

export default new ProviderHelper();