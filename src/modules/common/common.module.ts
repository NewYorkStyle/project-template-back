import {ParamsController} from './controllers/params.controller';
import {Params} from './entities/params.entity';
import {ParamsService} from './services/params.service';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  controllers: [ParamsController],
  imports: [TypeOrmModule.forFeature([Params])],
  providers: [ParamsService],
})
export class CommonModule {}
