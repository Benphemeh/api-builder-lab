'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('logs', {
      ...baseModelMigration(Sequelize),
      level: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      message: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      meta: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      timestamp: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('logs', {});
  },
};
