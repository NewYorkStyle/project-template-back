import {Module} from '@nestjs/common';

import {PermissionsModule} from '../permissions/permissions.module';
import {UsersModule} from '../users/users.module';

import {TestController} from './controllers/test.controller';
import {TestService} from './services/test.service';

@Module({
  controllers: [TestController],
  imports: [UsersModule, PermissionsModule],
  providers: [TestService],
})
export class TestModule {}
