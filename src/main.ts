import {AppModule} from './modules/app.module';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Project template back')
    .setDescription('API для project template')
    .setVersion('1.0')
    .addTag('project-template')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
