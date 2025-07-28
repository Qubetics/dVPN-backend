import Node from "./nodes/index";
import Sessions from "./session/index";
import Plans from "./plans/index";

Sessions.belongsTo(Node, { foreignKey: 'node_address', targetKey: 'address' });
Node.hasMany(Sessions, { foreignKey: 'node_address', sourceKey: 'address' });

// Each Plan belongs to one Node via nodeAddress → address
Plans.belongsTo(Node, {
    foreignKey: 'nodeAddress',
    targetKey: 'address',
});

// A Node can have many Plans
Node.hasMany(Plans, {
    foreignKey: 'nodeAddress',
    sourceKey: 'address',
});