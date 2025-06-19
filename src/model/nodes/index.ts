// src/models/Node.ts

import { DataTypes, Model } from "sequelize";
import dbConnectionHandler from "../../connection";
import User from "../user/index"; 

const sequelize = dbConnectionHandler.sequelize;

export interface INode {
  id: string;
  node_address: string;
  city: string;
  country: string;
  long: number;
  lat: number;
  isDelete: boolean;
  status: boolean;
  wallet_address: string; 
}

interface NodeInstance extends Model<INode>, INode {}

const Node = sequelize.define<NodeInstance>(
  "node",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    node_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    long: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    wallet_address: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,    
        key: "wallet_address",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true, 
  }
);


User.hasMany(Node, { foreignKey: "wallet_address" });

Node.sync({ alter: true }).catch((error) => {
  console.error("Error syncing Node table:", error);
});

export default Node;
