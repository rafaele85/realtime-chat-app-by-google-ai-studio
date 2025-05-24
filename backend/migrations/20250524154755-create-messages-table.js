'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      conversationId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'conversations', // Table name
          key: 'id',
        },
        onUpdate: 'CASCADE', // If conversation ID changes, update here
        onDelete: 'CASCADE', // If conversation is deleted, delete messages
      },
      senderId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Table name
          key: 'id',
        },
        onUpdate: 'CASCADE', // If user ID changes, update here
        onDelete: 'CASCADE', // If user is deleted, delete their messages
      },
      content: {
        type: Sequelize.DataTypes.STRING(1000),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  }
};