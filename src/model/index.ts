import Node from "./nodes/index";
import Sessions from "./session/index";

// Each Session belongs to a Node via node_address
Sessions.belongsTo(Node, {
  foreignKey: "node_address",
  targetKey: "address",
  as: "node",
});

// Each Node has many Sessions
Node.hasMany(Sessions, {
  foreignKey: "node_address",
  sourceKey: "address",
  as: "sessions",
});
