
const Sequelize = require('sequelize');
const sequelize = require('../database/db');
const User = require('./User');
const Msg = require('./Message');
const Channel = sequelize.define('Channel', {
    idChannel: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: Sequelize.ENUM('private', 'public'),
      allowNull: false
    }
  });
  // Relation entre Channel et Msg (un Channel peut avoir plusieurs Msgs)
Channel.hasMany(Msg, { foreignKey: 'idChannel' });
Channel.belongsToMany(User, { through: 'UserChannel', foreignKey: 'idChannel' });


  module.exports=Channel