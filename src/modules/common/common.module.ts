import {Module} from '@nestjs/common';

import {ParamsController} from './controllers/params.controller';
import {ParamsService} from './services/params.service';

@Module({
  controllers: [ParamsController],
  providers: [ParamsService],
})
export class CommonModule {}
