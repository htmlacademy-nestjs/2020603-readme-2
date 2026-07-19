import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { DomainExceptionFilter } from '@project/shared-errors';
import { AppModule } from './app/app.module.js';
import type { StorageConfig } from './app/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  const configService = app.get(ConfigService);
  const storage = configService.getOrThrow<StorageConfig>('storage');
  // Статика живёт вне префикса `api`: /static/<subDirectory>/<hashName>.
  await mkdir(storage.uploadDirectory, { recursive: true });
  app.useStaticAssets(storage.uploadDirectory, { prefix: storage.serveRoot });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Readme — File Storage Service')
    .setDescription('REST API сервиса хранения файлов')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('spec', app, document);

  const port = configService.get<number>('application.port', 3004);
  await app.listen(port);
  Logger.log(`🚀 File Storage:  http://localhost:${port}/api`);
  Logger.log(`📦 Static files:  ${storage.baseUrl}`);
  Logger.log(`📖 Swagger UI:    http://localhost:${port}/spec`);
}

bootstrap();
