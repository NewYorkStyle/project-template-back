import {AppModule} from './modules/app.module';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Project template back')
    .setDescription('API для project template')
    .setVersion(process.env.npm_package_version)
    .addTag('project-template')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  app.enableCors({
    credentials: true,
    origin: process.env.FRONT_URL,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
