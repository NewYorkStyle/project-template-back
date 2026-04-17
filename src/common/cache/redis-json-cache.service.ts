import {Injectable, Logger} from '@nestjs/common';

import {RedisService} from '../redis/redis.service';

@Injectable()
export class RedisJsonCacheService {
  private readonly logger = new Logger(RedisJsonCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.redis.get(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(
        `Redis get failed for key ${key}: ${(error as Error).message}`
      );
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSec: number): Promise<void> {
    try {
      await this.redisService.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        ttlSec
      );
    } catch (error) {
      this.logger.warn(
        `Redis set failed for key ${key}: ${(error as Error).message}`
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisService.redis.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis del failed for key ${key}: ${(error as Error).message}`
      );
    }
  }
}
