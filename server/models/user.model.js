'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  User.init({
    userName: DataTypes.STRING,
    googleAccount: DataTypes.STRING,
    googleToken: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};