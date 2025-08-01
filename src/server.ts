import { REDIS_ERR_MSG } from "../src/constants/redis.constant";
import App from "./app";
import { log } from './utils/helper.utils';
import * as config from './config';
import redisHelper from "../src/helpers/redis.helper";
import UserController from "./controllers/user.controller";
import dbConnectionHandler from "./connection"
import NodeController from "./controllers/node.controller";
import UserSessionController from "./controllers/user-session.controller";
import ERR from "../src/constants/server.constants";
import SubscriptionController from "./controllers/subscription.controller";
require('dotenv').config();

(async () => {
    try {
        await config.initiate();
        const app = new App([new UserController(), new NodeController(), new UserSessionController(), new SubscriptionController()]);

        // connect to the postgres server
        const isDBconnected = await dbConnectionHandler.createDBConnection();
        if (!isDBconnected) throw new Error(ERR.POSTGRES_CONN);

        //connect to the redis server
        const isRedisConnected = await redisHelper.connectRedis();
        if (!isRedisConnected) throw new Error(REDIS_ERR_MSG.CONN_ERR);

        // bind the post and listen for requests
        app.listen();
    } catch (err: any) {
        log.red(REDIS_ERR_MSG.CONN_ERR, err.mesaage);
    }
})();