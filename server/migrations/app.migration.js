'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Apps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        comment:'User id'
      },
      roleMemberSheet: {
        type: Sequelize.STRING,
        comment:'Google Authorization url'
      },
      savedDataUrl: {
        type: Sequelize.STRING,
        comment:'Google Data url'
      },
      published: {
        type: Sequelize.STRING,
        comment:'Publish or not'
      },
      developer: {
        type: Sequelize.STRING,
        comment:'Developer'
      },
      endUserIds: {
        type: Sequelize.STRING,
        comment:'End user id'
      },
      appName: {
        type: Sequelize.STRING,
        comment:'App Name'
      },
      googleAccount: {
        type: Sequelize.STRING,
        comment:'Google email'
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
    await queryInterface.dropTable('Apps');
  }
};