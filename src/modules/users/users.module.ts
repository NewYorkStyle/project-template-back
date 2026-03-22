import {Module} from '@nestjs/common';

import {MailModule} from '../mail/mail.module';
import {OtpModule} from '../otp/otp.module';
import {PermissionsModule} from '../permissions/permissions.module';

import {UsersController} from './controllers/users.controller';
import {UsersService} from './services/users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [OtpModule, MailModule, PermissionsModule],
  providers: [UsersService],
})
export class UsersModule {}
