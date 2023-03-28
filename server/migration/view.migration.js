'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Views', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      appId: {
        type: Sequelize.INTEGER,
        comment:'App id'
      },
      viewName: {
        type: Sequelize.STRING,
        comment:'View name'
      },
      savedDataUrl: {
        type: Sequelize.STRING,
        comment:'Google Data url'
      },
      columns: {
        type: Sequelize.INTEGER,
        comment:''
      },
      viewType: {
        type: Sequelize.STRING,
        comment:''
      },
      allowedActions: {
        type: Sequelize.STRING,
        comment:''
      },
      roles: {
        type: Sequelize.STRING,
        comment:''
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
    await queryInterface.dropTable('Views');
  }
};