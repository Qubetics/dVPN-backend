import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface Price {
    denom: string;
    base_value: string;
    quote_value: string;
}
interface ISession {
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
    inactive_at: string;
    start_at: string;
    status_at: string;
    price: Price;
}

interface SessionInstance extends Model<ISession>, ISession { }

const Sessions = sequelize.define<SessionInstance>(
    "sessions",
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
        inactive_at: {
            type: DataTypes.STRING,
            allowNull: false,
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

Sessions.sync({ alter: true }).catch((error: any) => {
    console.error("Error syncing Sessions table:", error);
});

export default Sessions;