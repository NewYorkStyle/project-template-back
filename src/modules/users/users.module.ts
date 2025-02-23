import {UsersController} from './controllers/users.controller';
import {User} from './entities/users.entity';
import {UsersService} from './services/users.service';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
})
export class UsersModule {}
