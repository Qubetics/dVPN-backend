import { Response } from "express";
const axios = require("axios");
import { ESResponse } from "@interfaces";
import {
  AccessTokenPayload,
  ApiResponse,
} from "interfaces/user.helpers.interfaces";
import redisHelper from "../helpers/redis.helper";
import { DATA_MODELS, RESPONSE_MESSAGES } from "../constants/index";
import { v4 as uuidv4 } from "uuid";
import { STATUS_CODES } from "http";
import {
  REDIS_ACCESS_TOKEN_EXP_TIME,
  REDIS_REFRESH_TOKEN_EXP_TIME,
} from "../constants/user.constant";
import PostgresDataHelper from "../helpers/postgres.data.helper";
import {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.utils";
const { fromBase64, toAscii, toBech32 } = require("@cosmjs/encoding");
const { Secp256k1, sha256 } = require("@cosmjs/crypto");
const { pubkeyToAddress } = require("@cosmjs/amino");

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
  public connectWallet = async (req: any, res: any): Promise<ApiResponse> => {
    try {
      // verify keplr signature

      const { wallet_address, signature } = req.body;

      const message = wallet_address;
      const signerAddress = wallet_address;

      // const verifyKeplrSignature = (
      //   address: string,
      //   pubKey: string,
      //   message: string,
      //   signature: KeplrSignature
      // ) => {
      //   // Encode the message into amino format
      //   const aminoEncoded = messageToAminoTransaction(
      //     address,
      //     Buffer.from(message).toString("base64")
      //   );
      //   const serialized = serializeSignDoc(aminoEncoded);

      //   // Hash the amino message that was signed
      //   const hashed = sha3.keccak_256(arrayify(serialized));

      //   // Compare signature
      //   const signatureToCompare = `0x${Buffer.from(
      //     signature.signature,
      //     "base64"
      //   ).toString("hex")}`;
      //   const pubkeyComputed = signatureToPubkey(
      //     signatureToCompare,
      //     Buffer.from(hashed, "hex")
      //   );

      //   return {
      //     verify: pubkeyComputed === pubKey,
      //   };
      // };

      // let signerAddress = wallet_address;
      // let pubKey = wallet_address;
      // let signature = signature;
      // Verify the signature
      
      // const isSignatureValid = verifyKeplrSignature(
      //   signerAddress,
      //   pubKey,
      //   signerAddress,
      //   signature
      // );
  
      // check the address is present in the DB if not than save that in the DB
      const userData=await PostgresDataHelper.findOneData(
        DATA_MODELS.User,
        {
          where: {
            wallet_address: `${wallet_address}`
          },
        }
      );

      if (!userData) {
        await PostgresDataHelper.saveData(DATA_MODELS.User, {
          id: uuidv4(),
          walletAddress: wallet_address.toLocaleLowerCase(),
          status: true
        });
      }

      // generate the token both access token and refresh token

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

      const access_token = generateAccessToken(access_token_payload);
      const refresh_token = generateRefreshToken(refresh_token_payload);

      const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
      const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

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
        refresh_token,
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
    refresh_token: any,
    res: Response
  ): Promise<ESResponse> => {
    try {
      // this removes the token from the redis hence preventing the re-login
      const { wallet_address, refresh_uuid } =
        verifyRefreshToken(refresh_token);

      const values = await redisHelper.client.get(refresh_uuid);

      if (!values) {
        throw new Error("No data found for refresh_uuid");
      }

      const { access_uuid } = JSON.parse(String(values));

      await redisHelper.removeFromRedis(refresh_uuid);
      await redisHelper.removeFromRedis(access_uuid);
      return {
        message: RESPONSE_MESSAGES.LOGOUT,
        status: Number(STATUS_CODES.SUCCESS),
        error: false,
      };
    } catch (error) {
      // return Response.INTERNAL_SERVER_ERROR;
    }
  };
  public userRefresh = async (
    refresh_token: any,
    res: Response
  ): Promise<ESResponse> => {
    try {
      // this removes the token from the redis hence preventing the re-login
      const { wallet_address, refresh_uuid } =
        verifyRefreshToken(refresh_token);

      const values = await redisHelper.client.get(refresh_uuid);

      if (!values) {
        throw new Error("No data found for refresh_uuid");
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

      const access_token = generateAccessToken(access_token_payload);
      const refresh_tokenn = generateRefreshToken(refresh_token_payload);

      const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
      const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

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
          accessToken: access_token,
          refreshToken: refresh_tokenn,
        },
        error: false,
        status: 200,
        message: RESPONSE_MESSAGES.SIGNUP,
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
