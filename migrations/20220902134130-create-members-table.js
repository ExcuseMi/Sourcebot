'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      discordId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        unique: true
      },
      steamId: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      vipStart: {
        allowNull: true,
        type: Sequelize.DATE
      },
      vipEnd: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Members');
  }
};