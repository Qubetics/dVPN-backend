import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface Deposite {
    denom: string;
    amount: string;
}
interface Base {
    id: string;
    address: string;
    inactive_at: string;
    status: string;
    status_at: string;
}

interface ISubscription {
    id: string;
    type: string;
    base: Base;
    node_address: string;
    gigabytes: string;
    hours: string;
    plan_id: string;
    deposite: Deposite;
}

interface SubscriptionInstance extends Model<ISubscription>, ISubscription { }

const Subscriptions = sequelize.define<SubscriptionInstance>(
    "subscriptions",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            unique: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        base: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        node_address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gigabytes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hours: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        plan_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deposite: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);


Subscriptions.sync({ alter: true })

export default Subscriptions;