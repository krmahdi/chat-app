const { sequelize } = require('./model');

const connectToDB = async () => {
  try {
    await sequelize.sync();
    console.log('SQL connected!');
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDB;
