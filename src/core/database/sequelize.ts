import { Sequelize } from 'sequelize-typescript';
import User from './models/user.model';
import Product from './models/product.model';
import ActivityModel from './models/activity-log.model';
import Log from './models/log.model';


const sequelize = new Sequelize({
  dialect: 'postgres', // or your database dialect
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME_TEST,
  models: [User, Product, ActivityModel, Log], // Register your models here
  logging: false, // Disable logging if not needed
});

export default sequelize;