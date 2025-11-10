import { DataTypes, Model, Optional } from "sequelize";
import DBConnectionHandler from "../../connection";

const sequelize = DBConnectionHandler.sequelize;

// Interfaces
interface Price {
  denom: string;
  base_value: string;
  quote_value: string;
}

interface INode {
  id: string;
  address: string;
  gigabyte_prices: Price[];
  hourly_prices: Price[];
  remote_url: string;
  plan_id: string;
  country: string;
  city: string;
  long: number;
  lat: number;
  node_status: string;
  flag_url?: string;
  protocol?: string;
  status_updated_at: Date;
  inactive_at: Date;
}

// Sequelize model instance type
interface NodeInstance extends Model<INode, Optional<INode, "flag_url">>, INode { }

// Sequelize model definition
const Node = sequelize.define<NodeInstance>(
  "nodes",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gigabyte_prices: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    hourly_prices: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    remote_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inactive_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    long: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    lat: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    node_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    flag_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    protocol: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    timestamps: true,
  }
);

// Sync table
Node.sync({ alter: true }).catch((error: any) => {
  console.error("Error syncing Node table:", error);
});

export default Node;
