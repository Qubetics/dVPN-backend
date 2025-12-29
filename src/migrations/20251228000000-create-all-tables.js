'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const schema=process.env.DB_SCHEMA

        // 1. Providers
        await queryInterface.createTable({tableName:'providers',schema}, {
            id: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            identity: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 2. Plans
        await queryInterface.createTable({tableName:'plans',schema}, {
            id: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
            },
            plan_id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            provider_address: {
                type: Sequelize.STRING,
                allowNull: false,
                // references: {
                //   model: 'providers',
                //   key: 'address'
                // },
                // onUpdate: 'CASCADE',
                // onDelete: 'CASCADE'
            },
            hours: {
                type: Sequelize.STRING,
                allowNull: false
            },
            gigabytes: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            prices: {
                type: Sequelize.JSONB,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 3. Nodes
        await queryInterface.createTable({tableName:'nodes',schema}, {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
            },
            address: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            gigabyte_prices: {
                type: Sequelize.JSONB,
                allowNull: false,
            },
            hourly_prices: {
                type: Sequelize.JSONB,
                allowNull: false,
            },
            remote_url: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            plan_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            inactive_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            country: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            long: {
                type: Sequelize.DOUBLE,
                allowNull: false,
            },
            lat: {
                type: Sequelize.DOUBLE,
                allowNull: false,
            },
            node_status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status_updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            flag_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            protocol: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deletedAt: {
                type: Sequelize.DATE
            }
        });

        // 4. Subscriptions
        await queryInterface.createTable({tableName:'subscriptions',schema}, {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
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
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 5. Sessions
        await queryInterface.createTable({tableName:'sessions',schema}, {
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
                allowNull: false,
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
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 6. Users
        await queryInterface.createTable({tableName:'users',schema}, {
            id: {
                type: Sequelize.UUID,
                unique: true,
                defaultValue: Sequelize.UUIDV4
            },
            wallet_address: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    async down(queryInterface, Sequelize) {
        const schema = process.env.DB_SCHEMA;
    
        // Drop tables in reverse order of creation
        await queryInterface.dropTable({ tableName: 'users', schema });
        await queryInterface.dropTable({ tableName: 'sessions', schema });
        await queryInterface.dropTable({ tableName: 'subscriptions', schema });
        await queryInterface.dropTable({ tableName: 'nodes', schema });
        await queryInterface.dropTable({ tableName: 'plans', schema });
        await queryInterface.dropTable({ tableName: 'providers', schema });
    }    
};
