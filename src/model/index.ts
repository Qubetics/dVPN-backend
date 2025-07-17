import Node from "./nodes/index";
import Sessions from "./session/index";

Sessions.belongsTo(Node, { foreignKey: 'node_address', targetKey: 'address' });
Node.hasMany(Sessions, { foreignKey: 'node_address', sourceKey: 'address' }); 