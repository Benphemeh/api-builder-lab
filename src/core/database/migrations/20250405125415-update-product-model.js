'use strict';

const baseModelMigration = require("../base-model/base-model.migration");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'size', {
      ...baseModelMigration(Sequelize),
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'breed', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'size');
    await queryInterface.removeColumn('products', 'breed');
    await queryInterface.removeColumn('products', 'type');
  },
};
