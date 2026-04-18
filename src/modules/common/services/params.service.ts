import {Injectable} from '@nestjs/common';

import {
  APP_PARAMS_CACHE_KEY,
  APP_PARAMS_CACHE_TTL_SEC,
} from '../../../common/cache/cache-keys';
import {RedisJsonCacheService} from '../../../common/cache/redis-json-cache.service';
import {PrismaService} from '../../../common/prisma/prisma.service';

type TParamRow = {
  name: string;
  value: string;
};

@Injectable()
export class ParamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisJsonCache: RedisJsonCacheService
  ) {}

  async getParams(): Promise<TParamRow[]> {
    const cached =
      await this.redisJsonCache.getJson<TParamRow[]>(APP_PARAMS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const rows = await this.prisma.param.findMany({
      select: {
        name: true,
        value: true,
      },
    });

    await this.redisJsonCache.setJson(
      APP_PARAMS_CACHE_KEY,
      rows,
      APP_PARAMS_CACHE_TTL_SEC
    );

    return rows;
  }
}
