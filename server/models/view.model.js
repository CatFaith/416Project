'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class View extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  View.init({
    appId: DataTypes.INTEGER,
    viewName: DataTypes.STRING,
    savedDataUrl: DataTypes.STRING,
    columns: DataTypes.INTEGER,
    viewType: DataTypes.STRING,
    allowedActions: DataTypes.STRING,
    roles: DataTypes.STRING,
    editColumns: DataTypes.STRING,
    filter: DataTypes.STRING,
    userFilter: DataTypes.STRING,
    editFilter: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'View',
  });
  return View;
};

