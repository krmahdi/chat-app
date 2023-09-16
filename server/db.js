const { sequelize } = require('./models');

const connectToDB = async () => {
  try {
    sequelize.sync({force: true});
    console.log('SQL connected!');
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDB;
