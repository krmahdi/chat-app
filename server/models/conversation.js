'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: 'admin',
        as: 'adminUser',
      });
    }
  }

  Conversation.init(
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
      participants: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '', // Default empty string
        get() {
          // Convert the comma-separated string to an array of integers
          return this.getDataValue('participants').split(',').map(Number);
        },
        set(value) {
          // Convert the array of integers to a comma-separated string
          this.setDataValue('participants', value.join(','));
        },
    },
    },
    {
      sequelize,
      modelName: 'Conversation',
      tableName: 'conversations',
    }
  );
  return Conversation;
};
