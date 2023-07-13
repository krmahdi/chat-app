// Importez les dépendances

const Sequelize = require('sequelize');
const sequelize = require('../database/db');
const Channel = require('./Channel');
const Msg = require('./Message');



// Modèle User
const User = sequelize.define('User', {
  idUser: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  blocked: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});
User.hasMany(Msg, { foreignKey: 'idUser' });
User.belongsToMany(Channel, { through: 'UserChannel', foreignKey: 'idUser' });
module.exports =   User
  
