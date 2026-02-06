'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA;

    // 1. sessionsfallback
    await queryInterface.createTable(
      { tableName: 'sessionsfallbacks', schema },
      {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        subscription_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        acc_address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        node_address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        download_bytes: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        upload_bytes: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        max_bytes: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        duration: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        max_duration: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        end_at: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        start_at: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status_at: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        price: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      }
    );

    // 2. subscriptionsfallback
    await queryInterface.createTable(
      { tableName: 'subscriptionsfallbacks', schema },
      {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        wallet_address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        plan_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        price: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        renewal_price_policy: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        inactive_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        start_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        status_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      }
    );

    // 3. blocks
    await queryInterface.createTable(
      { tableName: 'blocks', schema },
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },
        blockNumber: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          type: Sequelize.DATE,
        },
      }
    );
  },

  async down(queryInterface) {
    const schema = process.env.DB_SCHEMA;

    await queryInterface.dropTable({ tableName: 'blocks', schema });
    await queryInterface.dropTable({ tableName: 'subscriptionsfallbacks', schema });
    await queryInterface.dropTable({ tableName: 'sessionsfallbacks', schema });
  },
};