'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('channel', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      admin: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.ENUM('public', 'private', 'group'),
        allowNull: false,
      },
      participants: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('channel');
  },
};
