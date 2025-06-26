import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface Price {
  denom: string;
  amount: string;
}

interface IPlans {
    id: string;
    planId: string;
    providerAddress: string;
    duration: string;
    gigabytes:string;
    prices: Price;
    status:string;
    status_at: string;
}

interface PlansInstance extends Model<IPlans>, IPlans { }

const Plans = sequelize.define<PlansInstance>(
    "plans",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            unique: true,
        },
        planId: {
            type: DataTypes.STRING,
            unique: true,
        },
        providerAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gigabytes: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prices: {
            type: DataTypes.JSONB, // or use DataTypes.JSON if needed
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status_at: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true
    }
);

Plans.sync({ alter: true }).catch((error: any) => {
    console.error("Error syncing plans table:", error);
});

export default Plans;