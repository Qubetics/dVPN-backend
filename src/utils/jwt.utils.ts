
// src/utils/jwt.utils.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { initiate } from '../config/index';
import { AccessTokenPayload } from 'interfaces/user.helpers.interfaces';

(async () => {
  const success = await initiate();
  if (success) {
    console.log('Environment variables loaded ✅');
    // Start your server or other setup logic here
  } else {
    console.error('Failed to load environment config ❌');
  }
})();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;     // short-lived
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;     // long-lived


export const generateAccessToken = (payload: AccessTokenPayload) => {
  const options: SignOptions | any  = { expiresIn: ACCESS_TOKEN_EXPIRY};
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (payload: AccessTokenPayload) => {
  const options: SignOptions | any= { expiresIn: REFRESH_TOKEN_EXPIRY };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as AccessTokenPayload;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): AccessTokenPayload | null => {
  try {
    const decoded = jwt.decode(token);
    return decoded as AccessTokenPayload;
  } catch (error) {
    return null;
  }
};

