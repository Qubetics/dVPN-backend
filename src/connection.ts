import { Sequelize } from "sequelize";
import { log } from "./utils/helper.utils";
import * as config from './config/index';
import { EventEmitter } from "events";
import { connections } from "./utils/constant.util";

(async () => {
    await config.initiate();
})();

const sequelizeEvent = new EventEmitter();

const isProdSSL =
    process.env.NODE_ENV === 'production' &&
    process.env.DB_SSL === 'true';

const caCert = isProdSSL && process.env.DB_CA_CERT
    ? Buffer.from(process.env.DB_CA_CERT, 'base64').toString('utf-8')
    : undefined;

class DBConnectionHandler {
    static instance: DBConnectionHandler = null;

    //create instance
    static getInstance = () => {
        if (!DBConnectionHandler.instance) {
            DBConnectionHandler.instance = new DBConnectionHandler();
            delete DBConnectionHandler.constructor;
        }
        return DBConnectionHandler.instance;
    }

    public sequelize = new Sequelize({
        replication: {
            write: {
                host: process.env.DB_WRITE_HOST,
                username: process.env.DB_WRITE_USER,
                password: process.env.DB_WRITE_PASS,
                database: process.env.DB_WRITE_NAME,
                port: Number(process.env.DB_WRITE_PORT),
            },
            read: [
                {
                    host: process.env.DB_READ_HOST,
                    username: process.env.DB_READ_USER,
                    password: process.env.DB_READ_PASS,
                    database: process.env.DB_READ_NAME,
                    port: Number(process.env.DB_WRITE_PORT),
                },
            ],

        },
        dialect: "postgres",
        dialectOptions: isProdSSL
            ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                    ca: caCert,
                },
            }
            : {},
        logging: false,
        pool: {
            max: 100,
            min: 0,
            acquire: 10000,
            idle: 9000,
        },
        define: {
            schema: process.env.DB_SCHEMA,
        },
    });
    /**
   * connect to the postgresDB server
   * @returns boolean
   */
    createDBConnection = async () => {
        try {
            log.blue(connections.connecting);
            this._bindPostgresConnectionEvents();
            await this.sequelize.authenticate().then(() => {
                sequelizeEvent.emit(connections.connected);
            });
            // Create schema if not exists
            const schemaName = process.env.DB_SCHEMA;
            await this.sequelize
                .createSchema(schemaName, { logging: false })
                .catch((error) => {
                    if (
                        error.name === "SequelizeDatabaseError" &&
                        error.message.includes("already exists")
                    ) {
                        log.blue(`Schema ${schemaName} already exists.`);
                    } else {
                        log.red(`creating schema: ${error.message}`);
                    }
                });

            if (process.env.NODE_ENV == 'development') {
                await this.sequelize.sync({ alter: true });
            }

            return true;

        } catch (err) {
            log.red(connections.error, err);
            // sequelizeEvent.emit(connections.DISCONNECT);
            return false;
        }
    };
    /**
   * release the database connection
   */
    releaseDBConnection = async () => {
        await this.sequelize.close();
    };
    /**
   * for binding the postgresdb connection events
   */
    _bindPostgresConnectionEvents = () => {
        try {
            // Listen for the 'connect' event
            sequelizeEvent.on(connections.connected, () => {
                log.green(connections.connected);
            });

            // Listen for the 'disconnect' event
            sequelizeEvent.on(connections.disconnected, () => {
                log.red(connections.disconnected);
            });
        } catch (err) {
            log.red(connections.error, err);
        }
    };

}
const dbConnectionHandler = DBConnectionHandler.getInstance();
export default dbConnectionHandler;