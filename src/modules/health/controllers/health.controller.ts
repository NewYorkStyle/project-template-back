import {Controller, Get} from '@nestjs/common';
import {HealthCheck, HealthCheckService} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
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
