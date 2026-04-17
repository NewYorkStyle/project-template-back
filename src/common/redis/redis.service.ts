import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client?: Redis;

  async onModuleInit() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    const redis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      reconnectOnError: (err: Error) => {
        const m = err.message;
        if (
          m.includes('READONLY') ||
          m.includes('ECONNRESET') ||
          m.includes('ETIMEDOUT')
        ) {
          return true;
        }
        return false;
      },
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });

    try {
      await redis.connect();
    } catch (error) {
      redis.disconnect();
      throw error;
    }

    this.client = redis;
  }

  get redis(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client;
  }

  async onModuleDestroy() {
    if (!this.client) {
      return;
    }
    await this.client.quit();
  }
}
