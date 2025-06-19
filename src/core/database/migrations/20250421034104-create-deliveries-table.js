'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      ...baseModelMigration(Sequelize),
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      delivery_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      logistics_provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending', // pending, in-transit, delivered
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('deliveries');
  },
};
