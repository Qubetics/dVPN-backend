import Plans from "./plans/index";
import User from "./user/index";
import Session from "./session/index";
import Node from "./nodes/index";
import Providers from "./provider/index";
import Subscriptions from "./subscriptions/index";

Plans.hasMany(Subscriptions, {
    foreignKey: "plan_id",
    sourceKey: "plan_id",
    as: "subscriptions",
});

Subscriptions.belongsTo(Plans, {
    foreignKey: "plan_id",
    targetKey: "plan_id",
    as: "plans",    
});

Providers.hasMany(Plans, {
    foreignKey: "provider_address",
    sourceKey: "address",
    as: "plans",
});

Plans.belongsTo(Providers, {
    foreignKey: "provider_address",
    targetKey: "address",
    as: "providers",
});

Plans.hasMany(Node, {
    foreignKey: "plan_id",
    sourceKey: "plan_id",
    as: "nodes",
});

Node.belongsTo(Plans, {
    foreignKey: "plan_id",
    targetKey: "plan_id",
    as: "plans",
});

// Node.hasMany(Session, {
//     foreignKey: "node_address",
//     sourceKey: "address",
//     as: "sessions",
// });

// Session.belongsTo(Node, {
//     foreignKey: "node_address",
//     targetKey: "address",
//     as: "nodes",
// });

Subscriptions.hasMany(Node, {
  foreignKey: "plan_id",
  sourceKey: "plan_id",
  as: "nodes",
});

Node.belongsTo(Subscriptions, {
  foreignKey: "plan_id",
  targetKey: "plan_id",
  as: "subscriptions",
});


// export { Plans, Node, User, Session, Providers, Subscriptions };
