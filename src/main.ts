import {NestFactory} from '@nestjs/core';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import {generateOpenApiComponents} from './common/zod-openapi';
import {AppModule} from './modules/app.module';
import 'dotenv/config';
import './common/register-zod-schemas';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Project template back')
    .setDescription('API для project template')
    .setVersion(process.env.npm_package_version)
    .addTag('project-template')
    .build();

  const documentFactory = () => {
    const document = SwaggerModule.createDocument(app, config);
    const {components: zodComponents} = generateOpenApiComponents();
    const zodSchemas = zodComponents?.schemas ?? {};
    document.components = {
      ...document.components,
      schemas: {
        ...document.components?.schemas,
        ...zodSchemas,
      },
    } as OpenAPIObject['components'];
    return document;
  };
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

void bootstrap();
