import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface Price {
    denom: string;
    base_value: string;
    quote_value: string;
}

interface IPlans {
    id: string;
    planId: string;
    providerAddress: string;
    nodeAddress: string,
    hours: string;
    gigabytes: string;
    prices: Price[];
    status: string;
    status_at: Date;
}

interface PlansInstance extends Model<IPlans>, IPlans { }

const Plans = sequelize.define<PlansInstance>(
    "plans",
    {
        id: {
            type: DataTypes.UUID,
            unique: true,
            allowNull: false,
        },
        planId: {
            type: DataTypes.STRING,
            primaryKey: true,
    
        },
        providerAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nodeAddress: {
            type: DataTypes.STRING,
        },
        hours: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gigabytes: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prices: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    }
);

Plans.sync({ alter: true }).catch((error: any) => {
    console.error("Error syncing plans table:", error);
});

export default Plans;
