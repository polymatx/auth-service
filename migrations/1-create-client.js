'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('clients', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      application_name: {
        type: Sequelize.STRING,
        unique: true
      },
      client_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      client_secret: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      grants: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('clients');
  }
};
