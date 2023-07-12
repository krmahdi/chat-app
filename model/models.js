// Importez les dépendances
const Sequelize = require('sequelize');
const sequelize = new Sequelize("chat", 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});



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

// Modèle Msg
const Msg = sequelize.define('Msg', {
  idMsg: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  msg: {
    type: Sequelize.STRING,
    allowNull: false
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
});

// Modèle Channel
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

// Définissez les relations entre les modèles

// Relation entre User et Msg (un User peut avoir plusieurs Msgs)
User.hasMany(Msg, { foreignKey: 'idUser' });
Msg.belongsTo(User, { foreignKey: 'idUser' });

// Relation entre Channel et Msg (un Channel peut avoir plusieurs Msgs)
Channel.hasMany(Msg, { foreignKey: 'idChannel' });
Msg.belongsTo(Channel, { foreignKey: 'idChannel' });

// Relation entre User et Channel (un User peut être dans plusieurs Channels)
User.belongsToMany(Channel, { through: 'UserChannel', foreignKey: 'idUser' });
Channel.belongsToMany(User, { through: 'UserChannel', foreignKey: 'idChannel' });

// Exportez les modèles
module.exports = {
  User,
  Msg,
  Channel,
  sequelize
};
