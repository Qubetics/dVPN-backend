import * as redis from 'redis';
import { log } from '../utils/helper.utils';
import { REDIS_ERR_MSG,CLIENT_EVENTS } from '../constants/redis.constant';
require('dotenv').config();

class Redis {
  static instance: Redis = null;

  static getInstance = () => {
    if (!Redis.instance) {
      Redis.instance = new Redis();
      delete Redis.constructor;
    }
    return Redis.instance;
  };

  // this is client variable declared for accessing redis client in the whole class
  public client: redis.RedisClientType;

  // connect the the redis server
  public async connectRedis() {
    try {
      this.client = redis.createClient({
        url: `${process.env.REDIS_URL}/0`
      });

      // bind the redis client event
      this._bindRedisClientEvents();

      await this.client.connect();
      return true;
    } catch (err) {
      log.red(REDIS_ERR_MSG.CONN_ERR, err);
      return false;
    }
  }

  /**
   * release the redis connection
   */
  public async releaseRedisConnection() {
    await this.client.disconnect();
  }

  /**
   * It is use to store cookies in hash map dataset in redis
  /**
   * @param hashMap 
   * @param data 
   * @param expirationSeconds 
   * @returns 
   */
  public storeInRedis = async (
    hashMap: string,
    data: { [key: string]: string },
    expirationSeconds?: number
  ): Promise<number | null> => {
    try {
      // creating an hash map for storing data in the redis
      const result = await this.client.hSet(hashMap, data);

      if (expirationSeconds) {
        await this.client.expireAt(hashMap, expirationSeconds);
      }

      return result;
    } catch (error) {
      return null;
    }
  };

/**
 * this helper function used to update the expiration time of the token in redis
 * @param token 
 * @returns 
 */
public updateRedisTime = async (
  token: string,
  expiryTimeInSeconds: number
): Promise<number |boolean | null> => {
  try {
    const result = await this.client.expire(token, expiryTimeInSeconds);
    return result;
  } catch (error) {
    console.log("error ", error);

    return null;
  }
};

  /**
   *  It is use to get all data stored in hash map dataset in redis
   * @param hashMap
   * @returns
   */
  public getDataFromRedis = async (hashMap: string) => {
    try {
      // getting all the data present in the redis storage for the specific hashmap
      const userSession = await this.client.hGetAll(hashMap);

      return userSession;
    } catch (error) {
      return null;
    }
  };
  /**
   * It is use to remove data stored in hash map dataset in redis using the cookie token as key
   * @param token
   * @returns
   */
  public removeFromRedis = async (token:string) => {
    try {
      const result = this.client.del(token);
      return result;
    } catch (error) {
      return null;
    }
  };

  //***************** method for internal usage *****************/

  /**
   * bind the redis events for error handling and reconnection
   */
  private _bindRedisClientEvents = () => {
    try {
      // fired when client is trying to connect to redis server
      this.client.on('connect', () => {
        log.blue(CLIENT_EVENTS.CONNECT);
      });

      // fired when client is connected to redis server
      this.client.on('ready', () => {
        log.green(CLIENT_EVENTS.READY);
      });
      // fired when error thrown by redis server
      this.client.on('error', (err: Error) => {
        log.red(CLIENT_EVENTS.ERROR, err);
      });

      // fired by redis client try to reconnect to server
      this.client.on('end', () => {
        log.blue(CLIENT_EVENTS.END);
      });

      // fired by redis client try to reconnect to server
      this.client.on('reconnecting', () => {
        log.blue(CLIENT_EVENTS.RECONNECTING);
      });
    } catch (err) {
      log.red(CLIENT_EVENTS.BINDING_ERR, err);
    }
  };
}

const redisHelper = Redis.getInstance();
export default redisHelper;