import {Controller, Get} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {HealthCheck, HealthCheckService} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

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
      () =>
        Promise.resolve({
          app: {
            environment: process.env.NODE_ENV || 'development',
            status: 'up',
            timestamp: new Date().toISOString(),
          },
        }),
    ]);
  }
}
