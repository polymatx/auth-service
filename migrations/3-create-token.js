'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('tokens', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            access_id: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            refresh_id: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            session_id: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            user_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            client_id: {
                type: Sequelize.STRING,
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('tokens');
    }
};
