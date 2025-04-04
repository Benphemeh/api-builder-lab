// src/core/cache/cache.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  constructor(private readonly redisService: RedisService) {}

  /**
   * Get data from cache or fetch from source if not available
   * @param key Cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param ttl Time to live in seconds
   */

  private cacheManager = this.redisService.getClient();
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    let cachedData: string | null = null;
    try {
      cachedData = await this.cacheManager.get(key);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve cache for key "${key}": ${error.message}`,
      );
      return await fetchFn();
    }
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const freshData = await fetchFn();

    await this.cacheManager.set(key, JSON.stringify(freshData), 'EX', ttl);
    return freshData;
  }

  async get(key: string) {
    try {
      const data = await this.cacheManager.get(key);

      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600) {
    try {
      await this.cacheManager.set(key, value, 'EX', ttl);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Delete a specific cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Delete multiple cache keys matching a pattern
   * Note: This requires Redis client and won't work with other cache stores
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const redisClient = this.redisService.getClient();
    if (!redisClient) {
      throw new Error('Redis client not available');
    }

    // Use Redis SCAN to find keys matching pattern
    const keys = await new Promise<string[]>((resolve, reject) => {
      const foundKeys: string[] = [];
      const stream = redisClient.scanStream({ match: pattern, count: 100 });

      stream.on('data', (resultKeys: string[]) => {
        for (const key of resultKeys) {
          foundKeys.push(key);
        }
      });

      stream.on('error', (err: Error) => reject(err));
      stream.on('end', () => resolve(foundKeys));
    });

    // Delete all matched keys
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
}
