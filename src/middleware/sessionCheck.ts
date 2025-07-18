import { Response, Request, NextFunction } from "express";
import redisHelper from "../helpers/redis.helper";
import sendResponse from "../responses/response.helper";
import { DATA_MODELS, RESPONSE_MESSAGES, STATUS_CODES } from "../constants";
import { verifyAccessToken, decodeToken } from "../utils/jwt.utils";
import postgresDataHelper from "../helpers/postgres.data.helper";
// import UserModel from "../models/user.model";

/**
 * Middleware to validate access token and session from Redis.
 */
export const sessionCheck = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Fetch access token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.UNAUTHORIZED,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Decode token (optional - for debugging or UID access)
    const decoded = decodeToken(token);
    if (!decoded) {
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    // 3. Verify token signature and expiry
    const verifiedToken = verifyAccessToken(token);
    if (!verifiedToken) {
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    const { access_uuid, wallet_address } = verifiedToken;

    // 4. Validate UUID
    if (!access_uuid) {
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    // 5. Fetch session info from Redis using UUID
    const sessionData = await redisHelper.client.get(access_uuid);
    if (!sessionData) {
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    // 6. Parse session info if needed
    const parsedSession = JSON.parse(String(sessionData));
    const { refresh_uuid } = parsedSession;

    // 7. Validate wallet address and user existence in DB
    const userData = await postgresDataHelper.findOneData(DATA_MODELS.User, {
      where: {
        wallet_address: `${wallet_address}`,
      },
    });

    if (!userData) {
      return sendResponse(res, {
        message: RESPONSE_MESSAGES.USER_NOT_FOUND,
        status: STATUS_CODES.UNAUTHORIZED,
      });
    }

    // 8. Attach user and session to request
    req.user = { wallet_address: wallet_address, access_uuid: access_uuid, refresh_uuid: refresh_uuid };

    return next();
  } catch (err) {
    return sendResponse(res, {
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      status: STATUS_CODES.INTERNALSERVER,
    });
  }
};
