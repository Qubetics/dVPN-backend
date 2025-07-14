import { Request, Response } from "express";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants/index";
import { ApiResponse } from "../interfaces/user.helpers.interfaces";

class UserSessionHelper {
    constructor() {
        (async () => {})();
      }

  public UserSessionList = async (   
    wallet_address: string,
    limit?: number,
    page?: number,
    countTotal?: boolean,
    order?: string
    ): Promise<ApiResponse> => {
      try {

      if(!wallet_address || wallet_address==="undefined"){
        return {
          error: true,
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.UNAUTHORIZED
        };
      }
      const user = await PostgresDataHelper.findOneData(DATA_MODELS.User, {
        where: { wallet_address },
      });

      if (!user) {
        return {
          error: true,
          status: STATUS_CODES.NOTFOUND,
          message: RESPONSE_MESSAGES.NOT_FOUND,
        };
      }

      // Step 2: Get UserSessions for user.id
      limit = limit || 10;
      const offsetPage = page || 1;
      const offset = (offsetPage - 1) * limit;
      const sortOrder = order === "ASC" ? "ASC" : "DESC";

      const { rows, count } = await PostgresDataHelper.findAndCountAll(DATA_MODELS.UserSession, {
        where: { user_id: user.id },
        limit,
        offset,
        order: [["createdAt", sortOrder]],
      });

      const responseData: any = {
        plans: rows,
      };
  
      if (countTotal === true) {
        responseData.total = count;
      }
      return {
        data: responseData,
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

export default new UserSessionHelper();
