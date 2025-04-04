import { config } from 'dotenv';
config();

export const redisService = {
  port: Number(process.env.REDIS_PORT ?? 6379),
  username: process.env.REDIS_USERNAME ?? '',
  password: process.env.REDIS_PASSWORD ?? '',
  host: process.env.REDIS_HOST ?? '',
};
