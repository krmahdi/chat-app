const Sequelize = require('sequelize');
const sequelize = require('../database/db');
const User = require('./User');
const Channel = require('./Channel');

const Message = sequelize.define('Msg', {
  idMsg: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
});

Message.belongsTo(Channel, { foreignKey: 'idChannel' });
Message.belongsTo(User, { foreignKey: 'idUser' });

module.exports = Message;
