import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';

import {PrismaModule} from '../common/prisma/prisma.module';

import {AuthModule} from './auth/auth.module';
import {CommonModule} from './common/common.module';
import {HealthModule} from './health/health.module';
import {TestModule} from './test/test.module';
import {UsersModule} from './users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HealthModule,
    CommonModule,
    AuthModule,
    UsersModule,
    TestModule,
    PrismaModule,
  ],
})
export class AppModule {}
