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
    plan_id: string;
    provider_address: string;
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
        defaultValue: DataTypes.UUIDV4,
      },
      plan_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      provider_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hours: {
        type: DataTypes.STRING,
        allowNull: false
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
