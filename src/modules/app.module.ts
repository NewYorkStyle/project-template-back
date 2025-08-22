import {AuthModule} from './auth/auth.module';
import {CommonModule} from './common/common.module';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import 'dotenv/config';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      type: 'postgres',
      username: process.env.DB_USERNAME
    }),
  ],
})
export class AppModule {}
