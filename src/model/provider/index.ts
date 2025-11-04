import { DataType,DataTypes,Model } from "sequelize";
import DBConnectionHandler from "../../connection";
const sequelize = DBConnectionHandler.sequelize;

interface IProvider {
    id: string;
    address: string;
    identity?: string;
    website?: string;
    description?: string;
    status: string;
    status_at: Date;
}

interface ProviderInstance extends Model<IProvider>,IProvider { }

const Providers = sequelize.define<ProviderInstance>(
    "providers",
    {
       id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
       },
       address: {
         type: DataTypes.STRING,
         primaryKey: true,
         allowNull: false,
       },
       identity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
        timestamps: true,
    }
);

Providers.sync({alter: true}).catch((error: any)=>{
    console.error("error syncing provider table: ",error);
});

export default Providers;