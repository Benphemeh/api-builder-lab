'use strict';

const baseModelMigration = require('../base-model/base-model.migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      ...baseModelMigration(Sequelize),
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      products: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
