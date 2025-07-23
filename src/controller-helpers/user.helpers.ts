import { Response } from "express";
const axios = require("axios");
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
import { verifyKeplrSignature } from "./common.helpers";

class UserHelper {
  constructor() {
    (async () => {})();
  }
  /**
   * The user sign-in helper handles all the login operations and checks for valid users
   * @param req
   * @param res
   * @param payload
   * @param userAgent
   * @returns
   */
  public connectWallet = async (wallet_address: any, pubKey: any,signature:any): Promise<ApiResponse> => {
    try {
      const isSignatureValid = verifyKeplrSignature(
        wallet_address,
        pubKey,
        wallet_address,
        signature
      );

      if (!isSignatureValid?.verify) {
        return {
          error: true,
          status: Number(STATUS_CODES.UNAUTHORIZED),
          message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
        };
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
      await redisHelper.client.set(access_uuid, JSON.stringify(setDataAccess), {
        EX: REDIS_ACCESS_TOKEN_EXP_TIME.EXPIRE,
      });

      await redisHelper.client.set(
        refresh_uuid,
        JSON.stringify(setDataRefresh),
        {
          EX: REDIS_REFRESH_TOKEN_EXP_TIME.EXPIRE,
        }
      );

      return {
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
        error: false,
        status: 200,
        message: RESPONSE_MESSAGES.SIGNUP,
      };
    } catch (err: any) {
      return {
        error: true,
        data: { isLogin: false },
        status: Number(STATUS_CODES.INTERNALSERVER),
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  };

  public userLogout = async (
    refresh_token: any
  ): Promise<ESResponse> => {
    try {
      // this removes the token from the redis hence preventing the re-login
      if (refresh_token) {
        return {
          error: true,
          status: STATUS_CODES.BADREQUEST,
          message: RESPONSE_MESSAGES.BADREQUEST,
        };
      }

      const { refresh_uuid } = verifyRefreshToken(refresh_token);

      const values = await redisHelper.client.get(refresh_uuid);

      if (!values) {
        return {
          error: true,
          status: Number(STATUS_CODES.UNAUTHORIZED),
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        };
      }

      const parsedValues = JSON.parse(String(values));
      const access_uuid = parsedValues.access_token_uuid;

      await redisHelper.removeFromRedis(refresh_uuid);
      await redisHelper.removeFromRedis(access_uuid);
      return {
        message: RESPONSE_MESSAGES.LOGOUT,
        status: Number(STATUS_CODES.SUCCESS),
        error: false,
      };
    } catch (error) {
      return {
        error: true,
        status: Number(STATUS_CODES.INTERNALSERVER),
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  };
  
  public userRefresh = async (
    refresh_token: any
  ): Promise<ESResponse> => {
    try {
      // this removes the token from the redis hence preventing the re-login
      if (!refresh_token) {
        return {
          error: true,
          status: STATUS_CODES.BADREQUEST,
          message: RESPONSE_MESSAGES.BADREQUEST,
        };
      }

      const payload = verifyRefreshToken(refresh_token);

      if (!payload) {
        return {  
          error: true,
          status: STATUS_CODES.UNAUTHORIZED,
          message: RESPONSE_MESSAGES.INVALID_TOKEN,
        };
      }
      
      const { wallet_address, refresh_uuid } = payload;
      

      const values = await redisHelper.client.get(refresh_uuid);

      if (!values) {
        return {
          error: true,
          status: Number(STATUS_CODES.UNAUTHORIZED),
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        };
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

      await redisHelper.client.set(access_uuid, JSON.stringify(setDataAccess), {
        EX: REDIS_ACCESS_TOKEN_EXP_TIME.EXPIRE,
      });

      await redisHelper.client.set(
        refresh_uuidd,
        JSON.stringify(setDataRefresh),
        {
          EX: REDIS_REFRESH_TOKEN_EXP_TIME.EXPIRE,
        }
      );

      return {
        data: {
          accessToken: new_access_token,
          refreshToken: new_refresh_token,
        },
        error: false,
        status: 200,
        message: RESPONSE_MESSAGES.SUCCESS_NEW_TOKEN,
      };
    } catch (error) {
      return {
        error: true,
        data: { isLogin: false },
        status: Number(STATUS_CODES.INTERNALSERVER),
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      };
    }
  };
}

export default new UserHelper();
