import { config } from 'dotenv';
import { Dialect } from 'sequelize';

config();

const dbConfig = {
  development: {
    url: process.env.DB_URL,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT! as Dialect,
  },
  test: {
    url: process.env.DB_URL,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT! as Dialect,
  },
  production: {
    url: process.env.DB_URL,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT! as Dialect,
  },
};

export default dbConfig;

// import * as dotenv from 'dotenv';
// import { IDatabaseConfig } from './interfaces/dbConfig.interface';

// dotenv.config();

// export const databaseConfig: IDatabaseConfig = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME_DEVELOPMENT,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//   },
//   test: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME_TEST,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME_PRODUCTION,
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT,
//   },
// };
