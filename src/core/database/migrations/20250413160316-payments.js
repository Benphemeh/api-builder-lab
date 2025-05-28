'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('payments', {
      ...baseModelMigration(Sequelize),
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments', {});
  },
};
