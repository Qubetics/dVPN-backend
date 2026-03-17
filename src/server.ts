require('dotenv').config();
import { REDIS_ERR_MSG } from "./constants/redis.constant";
import App from "./app";
import { log } from './utils/helper.utils';
import * as config from './config';
import redisHelper from "./helpers/redis.helper";
import UserController from "./controllers/user.controller";
import dbConnectionHandler from "./connection"
import NodeController from "./controllers/node.controller";
import UserSessionController from "./controllers/user-session.controller";
import ERR from "./constants/server.constants";
import SubscriptionController from "./controllers/subscription.controller";
import AppController from "./controllers/app.controller";
import PlanController from "./controllers/plan.controller";
import ProviderController from "./controllers/provider.controller";

(async () => {
    try {
        await config.initiate();
        const app = new App([new UserController(), new NodeController(), new UserSessionController(), new SubscriptionController(), new AppController(), new PlanController(),new ProviderController()]);

        // connect to the postgres server
        const isDBconnected = await dbConnectionHandler.createDBConnection();
        if (!isDBconnected) throw new Error(ERR.POSTGRES_CONN);

        //connect to the redis server
        const isRedisConnected = await redisHelper.connectRedis();
        if (!isRedisConnected) throw new Error(REDIS_ERR_MSG.CONN_ERR);

        // bind the port and listen for requests
        app.listen();
    } catch (err: any) {
        if (err.message === ERR.POSTGRES_CONN) {
            log.red(ERR.POSTGRES_CONN, err.message);
        } else if (err.message === REDIS_ERR_MSG.CONN_ERR) {
            log.red(REDIS_ERR_MSG.CONN_ERR, err.message);
        } else {
            log.red(ERR.SERVER_ERROR, err.message);
        }
    }
})();