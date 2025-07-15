import { DataTypes, Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

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
    inactive_at: Date;
    country: string;
    city: string;
    long: string;
    lat: string;
    status: string;
    status_at: Date;
    flag_url?: string;
}
interface NodeInstance extends Model<INode>, INode { }

const Node = sequelize.define<NodeInstance>(
    'nodes',
    {
        id: {
            type: DataTypes.UUID,
            unique: true,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        lat: {
            type: DataTypes.STRING,
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
        flag_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
    
);

Node.sync({ alter: true }).catch((error: any) => {
    console.error("Error syncing Node table:", error);
});

export default Node;