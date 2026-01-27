import { ESResponse } from "@interfaces";
import {
  ApiResponse,
} from "interfaces/user.helpers.interfaces";
import redisHelper from "../helpers/redis.helper";
import { DATA_MODELS, RESPONSE_MESSAGES } from "../constants/index";
import { v4 as uuidv4 } from "uuid";
import { STATUS_CODES } from "../constants/index";
import {
  REDIS_ACCESS_TOKEN_EXP_TIME,
  REDIS_REFRESH_TOKEN_EXP_TIME,
} from "../constants/user.constant";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.utils";
import { errorHandler } from "../error-handler/index";
import { successHandler } from "../success-handler/index";
import { verifyKeplrSignature } from "./common.helpers";
import { KeplrSignature } from "../interfaces/keplrSignature.interfaces";

class UserHelper {
  constructor() {
    (async () => { })();
  }
  /**
   * The user sign-in helper handles all the login operations and checks for valid users
   * @param {string} wallet_address
   * @param {string} pubKey
   * @param {KeplrSignature} signature
   * @returns
   */
  public connectWallet = async (wallet_address: string, pubKey: string, signature: KeplrSignature): Promise<ApiResponse> => {
    try {
      const isSignatureValid = verifyKeplrSignature(
        wallet_address,
        pubKey,
        wallet_address,
        signature
      );

      if (!isSignatureValid?.verify) {
        return errorHandler({
          status: Number(STATUS_CODES.BADREQUEST),
          message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
        });
      }

      // check the address is present in the DB if not than save that in the DB
      const userData = await PostgresDataHelper.findOneData(DATA_MODELS.User, {
        where: {
          wallet_address: `${wallet_address}`,
        },
      });

      if (!userData) {
        await PostgresDataHelper.saveData(DATA_MODELS.User, {
          id: uuidv4(),
          wallet_address: wallet_address,
          status: true,
        });
      }

      // generate the token uuid both access token and refresh token
      const access_uuid = uuidv4();
      const refresh_uuid = uuidv4();

      const refresh_token_payload = {
        refresh_uuid: refresh_uuid,
        wallet_address: wallet_address,
      };

      const access_token_payload = {
        access_uuid: access_uuid,
        refresh_uuid: refresh_uuid,
        wallet_address: wallet_address,
      };

      // generate the token both access token and refresh token
      const access_token = generateAccessToken(access_token_payload);
      const refresh_token = generateRefreshToken(refresh_token_payload);

      const setDataAccess = {
        access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
        refresh_token_uuid: refresh_uuid,
      };

      const setDataRefresh = {
        access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
        refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY,
        access_token_uuid: access_uuid,
      };
      // set in the redis both the token
      await Promise.all([
        redisHelper.client.set(access_uuid, JSON.stringify(setDataAccess), {
          EX: REDIS_ACCESS_TOKEN_EXP_TIME.EXPIRE,
        }),
        redisHelper.client.set(
          refresh_uuid,
          JSON.stringify(setDataRefresh),
          {
            EX: REDIS_REFRESH_TOKEN_EXP_TIME.EXPIRE,
          }
        ),
      ]);

      return successHandler({
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
        status: 200,
        message: RESPONSE_MESSAGES.LOGIN,
      });
    } catch (err: any) {
      return errorHandler({
        data: { isLogin: false },
        status: Number(STATUS_CODES.INTERNALSERVER),
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  };

  /**
   *  Logs out the user by deleting the refresh and access token entries from Redis.
   * @param {string} refresh_token
   */
  public userLogout = async (
    refresh_token: string
  ): Promise<ESResponse> => {
    try {
      if (!refresh_token) {
        return errorHandler({
          status: STATUS_CODES.BADREQUEST,
          message: RESPONSE_MESSAGES.BADREQUEST,
        });
      }

      const { refresh_uuid } = verifyRefreshToken(refresh_token);

      const values = await redisHelper.client.get(refresh_uuid);

      if (!values) {
        return errorHandler({
          status: Number(STATUS_CODES.UNAUTHORIZED),
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
      }

      const parsedValues = JSON.parse(String(values));
      const access_uuid = parsedValues.access_token_uuid;

      await Promise.all([
        redisHelper.removeFromRedis(refresh_uuid),
        redisHelper.removeFromRedis(access_uuid),
      ]);
    
      return successHandler({
        message: RESPONSE_MESSAGES.LOGOUT,
        status: Number(STATUS_CODES.SUCCESS),
      });
    } catch (error) {
      return errorHandler({
        status: Number(STATUS_CODES.INTERNALSERVER),
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  };

  /**
   * Refreshes the user's session by validating the provided refresh token,
   * generating new access and refresh tokens, and updating them in Redis.
   * @param {string} refresh_token
   */
  public userRefresh = async (
    refresh_token: string
  ): Promise<ESResponse> => {
    try {
      // this removes the token from the redis hence preventing the re-login
      if (!refresh_token) {
        return errorHandler({
          status: STATUS_CODES.BADREQUEST,
          message: RESPONSE_MESSAGES.BADREQUEST,
        });
      }

      const payload = verifyRefreshToken(refresh_token);

      if (!payload) {
        return errorHandler({
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.INVALID_TOKEN,
        });
      }

      const { wallet_address, refresh_uuid } = payload;


      const values = await redisHelper.client.get(refresh_uuid);

      if (!values) {
        return errorHandler({
          status: Number(STATUS_CODES.UNAUTHORIZED),
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
      }

      const access_uuid = uuidv4();
      const refresh_uuidd = uuidv4();

      const refresh_token_payload = {
        refresh_uuid: refresh_uuidd,
        wallet_address: wallet_address,
      };

      const access_token_payload = {
        access_uuid: access_uuid,
        refresh_uuid: refresh_uuidd,
        wallet_address: wallet_address,
      };

      const new_access_token = generateAccessToken(access_token_payload);
      const new_refresh_token = generateRefreshToken(refresh_token_payload);

      const setDataAccess = {
        access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
        refresh_token_uuid: refresh_uuidd,
      };

      const setDataRefresh = {
        access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
        refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY,
        access_token_uuid: access_uuid,
      };

      // set in the redis both the token

      await Promise.all([
        redisHelper.client.set(access_uuid, JSON.stringify(setDataAccess), {
          EX: REDIS_ACCESS_TOKEN_EXP_TIME.EXPIRE,
        }),
        redisHelper.client.set(
          refresh_uuidd,
          JSON.stringify(setDataRefresh),
          {
            EX: REDIS_REFRESH_TOKEN_EXP_TIME.EXPIRE,
          }
        ),
      ]);

      // remove the please the previous token from the redis
      await redisHelper.client.del(refresh_uuid);

      return successHandler({
        data: {
          accessToken: new_access_token,
          refreshToken: new_refresh_token,
        },
        status: 200,
        message: RESPONSE_MESSAGES.SUCCESS_NEW_TOKEN,
      });
    } catch (error) {
      return errorHandler({
        status: Number(STATUS_CODES.INTERNALSERVER),
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  };
}

export default new UserHelper();
