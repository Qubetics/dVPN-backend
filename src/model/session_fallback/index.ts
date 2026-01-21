import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface Price {
    denom: string;
    base_value: string;
    quote_value: string;
}
interface ISessionsFallback {
    id: string;
    subscription_id: string;
    acc_address: string;
    node_address: string;
    download_bytes: string;
    upload_bytes: string;
    max_bytes: string;
    duration: string;
    max_duration: string;
    status: string;
    end_at: string;
    start_at: string;
    status_at: string;
    price: Price;
}

interface SessionsFallbackInstance extends Model<ISessionsFallback>, ISessionsFallback { }

const SessionsFallback = sequelize.define<SessionsFallbackInstance>(
    "sessionsfallback",
    {
        subscription_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        acc_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        node_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        download_bytes: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        upload_bytes: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        max_bytes: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        max_duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        end_at: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        start_at: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status_at: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

if (process.env.NODE_ENV == 'development') {
    SessionsFallback.sync({ alter: true }).catch((error: any) => {
        console.error("Error syncing Sessions table:", error);
    });
}

export default SessionsFallback;
