require("dotenv").config({ path: require("path").resolve(__dirname, "local.env") });

const isProdSSL =
  process.env.NODE_ENV === "production" &&
  process.env.DB_SSL === "true";

const caCert =
  isProdSSL && process.env.DB_CA_CERT
    ? Buffer.from(process.env.DB_CA_CERT, "base64").toString("utf-8")
    : undefined;

module.exports = {
  development: {
    username: process.env.DB_WRITE_USER,
    password: process.env.DB_WRITE_PASS,
    database: process.env.DB_WRITE_NAME,
    host: process.env.DB_WRITE_HOST,
    port: Number(process.env.DB_WRITE_PORT),
    dialect: "postgres",
    dialectOptions: isProdSSL
    ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
            ca: caCert,
        },
    }
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
    dialectOptions: isProdSSL
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          ca: caCert,
        },
      }
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
    dialectOptions: isProdSSL
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          ca: caCert,
        },
      }
      : {},
    logging: false,
  },
};
