import { DataTypes, Model, Optional } from "sequelize";
import DBConnectionHandler from "../../connection";

const sequelize = DBConnectionHandler.sequelize;

interface IBlock {
    id: string;
    blockNumber: string;
}

// Sequelize model instance type
interface BlockInstance extends Model<IBlock>, IBlock { }

// Sequelize model definition
const Block = sequelize.define<BlockInstance>(
    "blocks",
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        blockNumber: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

// Sync table
if (process.env.NODE_ENV == 'development') {
    Block.sync({ alter: true }).catch((error: any) => {
        console.error("Error syncing Node table:", error);
    });
}

export default Block;
