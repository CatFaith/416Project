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
        comment:'columns'
      },
      viewType: {
        type: Sequelize.STRING,
        comment:'viewType'
      },
      allowedActions: {
        type: Sequelize.STRING,
        comment:'allowed Actions'
      },
      roles: {
        type: Sequelize.STRING,
        comment:'roles'
      },
      editColumns: {
        type: Sequelize.STRING,
        comment:'edit Columns'
      },
      filter: {
        type: Sequelize.STRING,
        default: 'false',
        comment:'filter'
      },
      userFilter: {
        type: Sequelize.STRING,
        default: 'false',
        comment:'user Filter'
      },
      editFilter: {
        type: Sequelize.STRING,
        default: 'false',
        comment:'edit Filter'
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
