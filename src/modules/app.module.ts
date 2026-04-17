import {Module} from '@nestjs/common';
import {ThrottlerModule} from '@nestjs/throttler';

import {PrismaModule} from '../common/prisma/prisma.module';
import {RedisModule} from '../common/redis/redis.module';
import {createThrottlerModuleOptions} from '../common/throttler/throttler-options';

import {AuthModule} from './auth/auth.module';
import {CommonModule} from './common/common.module';
import {HealthModule} from './health/health.module';
import {TestModule} from './test/test.module';
import {UserToursModule} from './user-tours/user-tours.module';
import {UsersModule} from './users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot(createThrottlerModuleOptions()),
    HealthModule,
    CommonModule,
    AuthModule,
    UsersModule,
    TestModule,
    UserToursModule,
    PrismaModule,
    RedisModule,
  ],
})
export class AppModule {}
