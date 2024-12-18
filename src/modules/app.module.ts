import {CommonModule} from './common/common.module';
import {Params} from './common/entities/params.entity';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRoot({
      database: 'project_template',
      entities: [Params],
      host: 'localhost',
      password: 'admin',
      port: 5432,
      type: 'postgres',
      username: 'admin',
    }),
  ],
})
export class AppModule {}
