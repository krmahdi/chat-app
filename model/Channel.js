'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: 'admin',
        as: 'adminUser',
      });
    }
  }

  Channel.init(
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          max: 30,
          min: 3,
        },
      },
      admin: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.ENUM('public', 'private', 'group'),
        allowNull: false,
      },
     /* participants: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },*/
    },
    {
      sequelize,
      modelName: 'Channel',
      tableName: 'Channel',
    }
  );
  return Channel;
};
