'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users', // Name of the target model
        key: 'id', // Key in the target model that the foreign key references
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'user_id');
  },
};