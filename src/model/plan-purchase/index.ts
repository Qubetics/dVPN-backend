import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

// Interface for type safety
interface IPlanPurchase {
  id: string;
  wallet_address: string;
  planId: string;
}

// Model instance type
interface PlanPurchaseInstance 
  extends Model<IPlanPurchase>, IPlanPurchase {}

const PlanPurchase = sequelize.define<PlanPurchaseInstance>(
  "plan_purchase", // table name
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // auto-generate UUID
      primaryKey: true,
    },
    wallet_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Sync table with DB
PlanPurchase.sync({ alter: true }).catch((err: any) => {
  console.error("Error syncing PlanPurchase table:", err);
});

export default PlanPurchase;
