'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons', {
      ...baseModelMigration(Sequelize),
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      discount_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coupons');
  },
};
