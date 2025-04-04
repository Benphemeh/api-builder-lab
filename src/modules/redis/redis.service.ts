import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USERNAME,
      ...(process.env.NODE_ENV !== 'local' && {
        tls: {
          rejectUnauthorized: false,
          requestCert: false,
        },
      }),
      retryStrategy: (times) => {
        if (times > 5) {
          console.error(`Redis connection failed after ${times} attempts`);
          return null; // don't retry after 5 attempts
        }
        return Math.min(times * 100, 3000); // time between retries
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  getClient(): Redis {
    return this.client;
  }
}
