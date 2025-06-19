import { config } from 'dotenv';
import { resolve } from 'path';

export function initiate(): Promise<boolean> {
   return new Promise((resolvePromise) => {
      config({ path: resolve(__dirname, './local.env') });
      resolvePromise(true);
   });
}

// require('dotenv').config();

// // db token
// export const {REFRESH_TOKEN_SECRET,ACCESS_TOKEN_SECRET,REFRESH_TOKEN_EXPIRY,ACCESS_TOKEN_EXPIRY,} = process.env;

// // db redis
// export const{REDIS_HOST,REDIS_PORT,REDIS_URL,PORT} = process.env;
// // db write
// export const {DB_WRITE_HOST,DB_WRITE_PORT,DB_WRITE_NAME,DB_WRITE_USER,DB_WRITE_PASS} = process.env

// // db read
// export const {DB_READ_HOST,DB_READ_NAME,DB_READ_PORT,DB_READ_PASS,DB_READ_USER,DB_SCHEMA} = process.env

// // db ssl
// export const {DB_SSL} = process.env