import { ACTIVE, DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES, UNDEFINED } from "../constants/index";
import { errorHandler } from "../error-handler/index";
import { successHandler } from "../success-handler/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";
import postgresDataHelper from "../helpers/postgres.data.helper";
import Plans from "../model/plans/index";
import Subscriptions from "../model/subscriptions/index";
import Node from "../model/nodes/index"
import { Sequelize } from "sequelize";

class ProviderHelper {

  constructor() {
    (() => { })();
  }

  public getProviderList = async (walletAddress: string, subscribed: boolean): Promise<ApiResponse> => {
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
        ["name", "address", "identity", "website"], // Provider attributes
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
                where: { status: ACTIVE }
              },
              {
                model: Node,
                as: "nodes",
                attributes: ["country"], // We'll use this to count countries
              },
            ],
          },
        ],
        {
          order: [['name', 'ASC']],
          raw: false
        }
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
      const latestSessions = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Sessions,
        { acc_address: walletAddress },
        ["start_at"], // get only needed columns
        [
          {
            model: Node,
            as: "nodes",
            include: [
              {
                model: Plans,
                as: "plans",
                attributes: ["provider_address"],
              },
            ],
          },
        ],
        {
          limit: 1,
          raw: false,
          order: [["start_at", "DESC"]], // 👈 latest session first
        }
      );

      const latestSession = latestSessions?.[0] || null;

      const latestProviderAddress =
        latestSession?.nodes?.plans?.provider_address || null;

      const providerRecentListData = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Providers,
        {},
        ["name", "address", "identity", "website"],
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
                where: { wallet_address: walletAddress },
                required: true,
              },
            ],
            required: true,
          },
        ],
        {
          raw: false,
          order: [
            [
              Sequelize.literal(
                `CASE WHEN "providers"."address" = '${latestProviderAddress}' THEN 0 ELSE 1 END`
              ),
              "ASC",
            ],
            ["name", "ASC"],
          ],
        }
      );

      const formattedData = providerRecentListData.map((provider: any) => {
        const plans = provider?.plans ?? [];

        const subscribedPlanIds = plans
          .filter((plan: any) => plan?.subscriptions?.length > 0)
          .map((plan: any) => plan.plan_id);

        return {
          name: provider.name,
          address: provider.address,
          identity: provider.identity,
          website: provider.website,
          isUserSubscribed: subscribedPlanIds.length > 0,
          ...(subscribedPlanIds.length > 0 && { subscribedPlanIds })
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

  public getCountryProviderList = async (
    walletAddress: string,
    country: string
  ): Promise<ApiResponse> => {
    try {
      if (!walletAddress || !country) {
        return errorHandler({
          status: STATUS_CODES.BADREQUEST,
          message: "Wallet address and country are required",
        });
      }
  
      const providers = await postgresDataHelper.findDataFromJoinModels(
        DATA_MODELS.Providers,
        {},
        [
          "name",
          "address",
          "identity",
          "website",
          "description",
          "status",
          "status_at",
        ],
        [
          {
            model: Plans,
            as: "plans",
            required: true,
            attributes: ["plan_id"],
            include: [
              {
                model: Node,
                as: "nodes",
                required: true,
                attributes: ["plan_id", "address"],
                where: { country },
              },
              {
                model: Subscriptions,
                as: "subscriptions",
                required: false,
                attributes: ["plan_id"],
                where: { wallet_address: walletAddress },
              },
            ],
          },
        ],
        {
          raw: false,
        }
      );
  
      const finalResult = providers.map((provider: any) => {
  
        // All plan_ids that this user purchased under this provider
        const purchasedPlanIds =
          provider.plans
            ?.filter((p: any) => p.subscriptions?.length > 0)
            ?.map((p: any) => p.plan_id) || [];
  
        const isSelected = purchasedPlanIds.length > 0;
  
        return {
          id: provider.id,
          name: provider.name,
          address: provider.address,
          identity: provider.identity,
          website: provider.website,
          description: provider.description,
          status: provider.status,
          status_at: provider.status_at,
  
          isSelected,
          selectedPlanIds: purchasedPlanIds, // ✅ ALL PURCHASED PLAN IDs
        };
      });
  
      return successHandler({
        data: finalResult,
        status: STATUS_CODES.SUCCESS,
        message: "Provider list fetched successfully",
      });
  
    } catch (error) {
      console.error("Error in getCountryProviderList:", error);
      return errorHandler({
        status: STATUS_CODES.INTERNALSERVER,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  };
  
}  

export default new ProviderHelper();