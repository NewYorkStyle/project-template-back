import {Module} from '@nestjs/common';

import {ParamsController} from './controllers';
import {ParamsService} from './services';

@Module({
  controllers: [ParamsController],
  providers: [ParamsService],
})
export class CommonModule {}
