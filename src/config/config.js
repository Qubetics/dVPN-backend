require("dotenv").config({ path: require("path").resolve(__dirname, "local.env") });

module.exports = {
  development: {
    username: process.env.DB_WRITE_USER,
    password: process.env.DB_WRITE_PASS,
    database: process.env.DB_WRITE_NAME,
    host: process.env.DB_WRITE_HOST,
    port: Number(process.env.DB_WRITE_PORT),
    dialect: "postgres",
    dialectOptions:
      process.env.NODE_ENV === "production" && process.env.DB_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: true } }
        : {},
    logging: false,
  },
  testnet: {
    username: process.env.DB_WRITE_USER,
    password: process.env.DB_WRITE_PASS,
    database: process.env.DB_WRITE_NAME,
    host: process.env.DB_WRITE_HOST,
    port: Number(process.env.DB_WRITE_PORT),
    dialect: "postgres",
    dialectOptions:
      process.env.NODE_ENV === "production" && process.env.DB_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: true } }
        : {},
    logging: false,
  },
  production: {
    username: process.env.DB_WRITE_USER,
    password: process.env.DB_WRITE_PASS,
    database: process.env.DB_WRITE_NAME,
    host: process.env.DB_WRITE_HOST,
    port: Number(process.env.DB_WRITE_PORT),
    dialect: "postgres",
    dialectOptions:
      process.env.NODE_ENV === "production" && process.env.DB_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: true } }
        : {},
    logging: false,
  },
};
