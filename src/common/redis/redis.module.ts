import {Global, Module} from '@nestjs/common';

import {RedisJsonCacheService} from '../cache/redis-json-cache.service';

import {RedisService} from './redis.service';

@Global()
@Module({
  exports: [RedisService, RedisJsonCacheService],
  providers: [RedisService, RedisJsonCacheService],
})
export class RedisModule {}
