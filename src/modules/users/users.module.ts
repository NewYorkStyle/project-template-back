import {User} from './entities/users.entity';
import {UsersService} from './services/users.service';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  // controllers: [UsersController],  TODO Расскоментить в случае дальнейшей работы с юзерами
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
})
export class UsersModule {}
