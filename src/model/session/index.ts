import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;


interface Bandwidth{
    upload: string;
    download: string;
}

interface ISessions {
    id: string;
    subscription_id: string;
    node_address: string;
    address: string;
    bandwidth:Bandwidth;
    duration: string;
    inactive_at: string;
    status: string;
    status_at:string;
}

interface SessionsInstance extends Model<ISessions>, ISessions { }

const Sessions = sequelize.define<SessionsInstance>(
    'sessions',
    {
        id:{
           type: DataTypes.UUID,
            primaryKey: true,
            unique: true,
        },
        subscription_id:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        node_address:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        address:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        bandwidth:{
            type: DataTypes.JSONB,
            allowNull: false,
        },
        duration:{
            type: DataTypes.STRING,
            allowNull: false,
        },
         inactive_at:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        status:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        status_at:{
            type: DataTypes.STRING,
            allowNull: false,
        }

    },
    {
        timestamps: true
    }
)
Sessions.sync({ alter: true }).catch((error: any) => {
    console.error("Error syncing Sessions table:", error);
});

export default Sessions;