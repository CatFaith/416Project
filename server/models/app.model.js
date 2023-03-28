'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class App extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  App.init({
    userId: DataTypes.INTEGER,
    roleMemberSheet: DataTypes.STRING,
    savedDataUrl: DataTypes.STRING,
    endUserIds: DataTypes.STRING,
    published: DataTypes.STRING,
    developer: DataTypes.STRING,
    appName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'App',
  });
  return App;
};