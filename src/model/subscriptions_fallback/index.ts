import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface Price {
    denom: string;
    base_value: string;
    quote_value: string;
}

interface ISubscriptionsFallback {
    id: string;
    wallet_address: string;
    plan_id: string;
    price: Price;
    renewal_price_policy: string;
    status: string;
    inactive_at: Date | null;
    start_at: Date | null;
    status_at: Date | null;
}

interface SubscriptionsFallbackInstance extends Model<ISubscriptionsFallback>, ISubscriptionsFallback { }

const SubscriptionsFallback = sequelize.define<SubscriptionsFallbackInstance>(
    "subscriptionsfallbacks",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        wallet_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        plan_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        price: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        renewal_price_policy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        inactive_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        start_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

if (process.env.NODE_ENV == 'development') {
    SubscriptionsFallback.sync({ alter: true }).catch((error: any) => {
        console.error("Error syncing subscriptions table:", error);
    });
}

export default SubscriptionsFallback;
