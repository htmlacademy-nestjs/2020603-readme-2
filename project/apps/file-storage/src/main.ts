import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { setupApplication, startApplication } from '@project/shared-config';
import { AppModule } from './app/app.module.js';
import { storageConfig } from './app/config';
import type { StorageConfig } from './app/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setupApplication(app, {
    title: 'Readme — File Storage Service',
    description: 'REST API сервиса хранения файлов',
  });

  const storage = app.get<StorageConfig>(storageConfig.KEY);
  // Статика живёт вне префикса `api`: /static/<subDirectory>/<hashName>.
  await mkdir(storage.uploadDirectory, { recursive: true });
  app.useStaticAssets(storage.uploadDirectory, { prefix: storage.serveRoot });

  await startApplication(app, 'File Storage');
  Logger.log(`📦 Static files: ${storage.baseUrl}`);
}

void bootstrap();
