import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface IUserSession {
  id: string;
  user_id: string;
  node_id: string;
  start_time: Date;
  end_time: Date;
}

interface UserSessionInstance extends Model<IUserSession>, IUserSession {}

const UserSessions = sequelize.define<UserSessionInstance>(
  "user_sessions",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    node_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSessions.sync({ alter: true }).catch((error: any) => {
  console.error("Error syncing UserSessions table:", error);
});

export default UserSessions;
