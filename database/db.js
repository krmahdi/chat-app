

const Sequelize = require('sequelize');
const sequelize = new Sequelize("chat", 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});
module.exports =sequelize
