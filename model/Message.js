'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate({ Channel, User }) {
      // define association here
      this.belongsTo(Channel, {
        foreignKey: 'ChannelId',
        as: 'channel',
      });

      this.belongsTo(User, {
        foreignKey: 'senderId',
        as: 'user',
      });
    }
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.createdAt;
      delete values.updatedAt;
      return values;
    }

  }
  Message.init(
    {
      body: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      channelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
    }
  );
  return Message;
};
