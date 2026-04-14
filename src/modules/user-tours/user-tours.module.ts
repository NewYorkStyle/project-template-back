import {Module} from '@nestjs/common';

import {UserToursController} from './controllers/user-tours.controller';
import {UserToursService} from './services/user-tours.service';

@Module({
  controllers: [UserToursController],
  providers: [UserToursService],
})
export class UserToursModule {}
