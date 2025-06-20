'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseModelMigration = require('../base-model/base-model.migration');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const Gender = ['male', 'female', 'other'];
    const USER_ROLE = ['admin', 'user', 'author', 'super admin'];

    await queryInterface.createTable('users', {
      ...baseModelMigration(Sequelize),
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM(...Gender),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM(...USER_ROLE),
        defaultValue: 'author',
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_verification_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reset_password_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reset_password_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_gender";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";',
    );
  },
};
