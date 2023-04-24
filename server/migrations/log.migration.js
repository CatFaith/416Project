'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
        comment:'type'
      },
      model: {
        type: Sequelize.STRING,
        comment:'model'
      },
      method: {
        type: Sequelize.STRING,
        comment:'method'
      },
      message: {
        type: Sequelize.STRING,
        comment:'message'
      },
      operatorUser: {
        type: Sequelize.STRING,
        comment:'operator User'
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
    await queryInterface.dropTable('Logs');
  }
};
