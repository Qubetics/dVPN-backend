import { Response, Request, NextFunction } from "express";
import redisHelper from "../helpers/redis.helper";
import sendResponse from "../responses/response.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants";
import { verifyAccessToken, decodeToken } from "../utils/jwt.utils";
import postgresDataHelper from "../helpers/postgres.data.helper";

/**
 * Middleware to validate access token and session from Redis.
 * @param {any} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const sessionCheck = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("1");
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.UNAUTHORIZED,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = decodeToken(token);
    if (!decoded) {
      console.log("2");
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    // Verify token signature and expiry
    const verifiedToken = verifyAccessToken(token);
    if (!verifiedToken) {
      console.log("3");
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    const { access_uuid, wallet_address } = verifiedToken;


    if (!access_uuid) {
      console.log("4");
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    
    const sessionData = await redisHelper.client.get(access_uuid);
    if (!sessionData) {
      console.log("5");
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }
    
    const parsedSession = JSON.parse(String(sessionData));
    const { refresh_uuid } = parsedSession;

    const userData = await postgresDataHelper.findOneData(DATA_MODELS.User, {
      where: {
        wallet_address: `${wallet_address}`,
      },
    });

    if (!userData) {
      console.log("6");
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.USER_NOT_FOUND,
        status: STATUS_CODES.NOTFOUND,
      });
    }

    // 8. Attach user and session to request
    req.user = { wallet_address: wallet_address, access_uuid: access_uuid, refresh_uuid: refresh_uuid };

    return next();
  } catch (err) {
    console.log("7");
    return sendResponse(res, {
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      status: STATUS_CODES.INTERNALSERVER,
    });
  }
};
