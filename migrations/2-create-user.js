'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.STRING( 191 ),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING( 191 ),
                allowNull: false
            },
            mobile: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            firstname: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            lastname: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            password: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            age: {
                type: Sequelize.INTEGER( 11 ),
                allowNull: true
            },
            email_verified: {
                type: Sequelize.INTEGER( 1 ),
                allowNull: true,
                defaultValue: '0'
            },
            phone_verified: {
                type: Sequelize.INTEGER( 1 ),
                allowNull: true,
                defaultValue: '0'
            },
            verify: {
                type: Sequelize.INTEGER( 1 ),
                allowNull: true,
                defaultValue: '0'
            },
            remember_token: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            referral_code: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            referred_by: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            config: {
                type: Sequelize.STRING( 191 ),
                allowNull: true
            },
            type: {
                type: Sequelize.ENUM( ['ordinary', 'business'] ),
                allowNull: true,
                defaultValue: 'ordinary'
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true
            },
            ip: {
                type: Sequelize.STRING,
                allowNull: true
            },
            country: {
                type: Sequelize.STRING,
                allowNull: true
            },
            version: {
                type: Sequelize.STRING,
                allowNull: true
            },
            platform: {
                type: Sequelize.ENUM ( 'android', 'ios', 'other' ),
                allowNull: true
            },
            block: {
                type: Sequelize.INTEGER ( 1 ),
                defaultValue: '0'
            },
            lang: {
                type: Sequelize.STRING,
                defaultValue: 'en'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('users');
    }
};
