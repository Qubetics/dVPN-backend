// import dbConnectionHandler from "../../connection";
import { DataTypes,Model } from "sequelize";
// const sequeslize=dbConnectionHandler.sequelize;
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

export interface IUser {
    id: string;
    wallet_address: string;
    status: boolean
}

console.log("1111111");

interface UserInstance extends Model<IUser>, IUser {}
const User = sequelize.define<UserInstance>(
    "user",
    {
        id: {
            type:DataTypes.UUID,
            unique: true
        },
        wallet_address: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: true
    }
);

User.sync({ alter: true }).catch((error: any) => {
    console.error("Error syncing table:", error);
  });
  
  export default User;