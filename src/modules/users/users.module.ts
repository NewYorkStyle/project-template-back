import {MailModule} from '../mail/mail.module';
import {OtpModule} from '../otp/otp.module';
import {UsersController} from './controllers/users.controller';
import {User} from './entities/users.entity';
import {UsersService} from './services/users.service';
import {PermissionsModule} from '../permissions/permissions.module';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    OtpModule,
    MailModule,
    PermissionsModule,
  ],
  providers: [UsersService],
})
export class UsersModule {}
