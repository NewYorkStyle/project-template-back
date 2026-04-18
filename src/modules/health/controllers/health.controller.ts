import {Controller, Get} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';

import {RedisService} from '../../../common/redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private readonly healthIndicator: HealthIndicatorService,
    private readonly redisService: RedisService
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Проверка работоспособности приложения',
  })
  @ApiResponse({
    description:
      'При успехе всех индикаторов — объект Terminus (status, info, error, details)',
    schema: {
      $ref: '#/components/schemas/HealthCheckOkResponseDto',
    },
    status: 200,
  })
  check() {
    return this.health.check([
      async () => {
        const redis = this.healthIndicator.check('redis');

        try {
          const pong = await this.redisService.redis.ping();

          if (pong === 'PONG') {
            return redis.up();
          }

          return redis.down({message: 'unexpected ping response'});
        } catch (error) {
          return redis.down({message: (error as Error).message});
        }
      },
      () => {
        const app = this.healthIndicator.check('app');

        return app.up({
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
        });
      },
    ]);
  }
}
