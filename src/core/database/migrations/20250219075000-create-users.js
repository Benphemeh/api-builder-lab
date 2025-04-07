// 'use strict';
// import { Gender, USER_ROLE } from '../../enums';
// export default {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('users', {
//       first_name: {
//         type: Sequelize.STRING,
//         allowNull: true,
//       },
//       last_name: {
//         type: Sequelize.STRING,
//         allowNull: true,
//       },
//       email: {
//         type: Sequelize.STRING,
//         unique: true,
//         allowNull: false,
//       },
//       password: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       gender: {
//         type: Sequelize.ENUM(...Object.values(Gender)),
//         allowNull: false,
//       },
//       role: {
//         type: Sequelize.ENUM(...Object.values(USER_ROLE)),
//         defaultValue: 'AUTHOR',
//       },
//     });
//   },

//   async down(queryInterface) {
//     await queryInterface.dropTable('users');
//   },
// };

'use strict';
const baseModelMigration = require('../base-model/base-model.migration');
// eslint-disable-next-line @typescript-eslint/no-var-requires

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First get the enum values for Gender and USER_ROLE
    const Gender = ['MALE', 'FEMALE', 'OTHER']; // Replace with actual values
    const USER_ROLE = ['ADMIN', 'USER', 'AUTHOR']; // Replace with actual values

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
        defaultValue: 'AUTHOR',
      },
    });
  },

  async down(queryInterface) {
    // For ENUM types, we need to drop them after dropping the table
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_gender";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";',
    );
  },
};
