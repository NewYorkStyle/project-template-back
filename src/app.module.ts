import {AppController} from './app.controller';
import {AppService} from './app.service';
import {Module} from '@nestjs/common';

@Module({
  controllers: [AppController],
  imports: [],
  providers: [AppService],
})
export class AppModule {}
