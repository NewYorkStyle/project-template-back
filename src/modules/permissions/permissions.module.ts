import {Permissions} from './entities/permissions.entity';
import {User_Permissions} from './entities/user-premissions.entity';
import {PermissionsService} from './services/permissions.service';
import {User} from '../users/entities/users.entity';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  exports: [PermissionsService],
  imports: [TypeOrmModule.forFeature([Permissions, User_Permissions, User])],
  providers: [PermissionsService],
})
export class PermissionsModule {}
