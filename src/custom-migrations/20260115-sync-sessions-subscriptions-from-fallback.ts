import DBConnectionHandler from "../connection";

const sequelize = DBConnectionHandler.sequelize;
const schema=process.env.DB_SCHEMA || 'public';

async function up() {
  try {
    await sequelize.transaction(async (transaction) => {

      // ===============================
      // SUBSCRIPTIONS ← FALLBACK
      // Insert only if NOT exists
      // ===============================
      await sequelize.query(
        `
        INSERT INTO ${schema}.subscriptions (
          id,
          wallet_address,
          plan_id,
          price,
          renewal_price_policy,
          status,
          inactive_at,
          start_at,
          status_at,
          "createdAt",
          "updatedAt"
        )
        SELECT
          sf.id,
          sf.wallet_address,
          sf.plan_id,
          sf.price,
          sf.renewal_price_policy,
          sf.status,
          sf.inactive_at,
          sf.start_at,
          sf.status_at,
          NOW(),
          NOW()
        FROM ${schema}.subscriptionsfallbacks sf
        WHERE NOT EXISTS (
          SELECT 1 FROM ${schema}.subscriptions s WHERE s.id = sf.id
        );
        `,
        { transaction }
      );

      // ===============================
      // SESSIONS ← FALLBACK
      // Insert only if NOT exists
      // ===============================
      await sequelize.query(
        `
        INSERT INTO ${schema}.sessions (
          id,
          subscription_id,
          acc_address,
          node_address,
          download_bytes,
          upload_bytes,
          max_bytes,
          duration,
          max_duration,
          status,
          start_at,
          end_at,
          status_at,
          price,
          "createdAt",
          "updatedAt"
        )
        SELECT
          sf.id,
          sf.subscription_id,
          sf.acc_address,
          sf.node_address,
          sf.download_bytes,
          sf.upload_bytes,
          sf.max_bytes,
          sf.duration,
          sf.max_duration,
          sf.status,
          sf.start_at,
          sf.end_at,
          sf.status_at,
          sf.price,
          NOW(),
          NOW()
        FROM ${schema}.sessionsfallbacks sf
        WHERE NOT EXISTS (
          SELECT 1 FROM ${schema}.sessions s WHERE s.id = sf.id
        );
        `,
        { transaction }
      );

    });

    console.log(
      "Subscriptions & Sessions inserted from fallback (existing records skipped)"
    );
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

async function down() {
  /**
   * Data sync migrations are NOT safely reversible.
   */
  console.log("Down migration skipped (not reversible)");
  process.exit(0);
}

// Run like your other migrations
if (process.argv[2] === "down") {
  down();
} else {
  up();
}
