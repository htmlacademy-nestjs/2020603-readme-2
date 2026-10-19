import { NestFactory } from '@nestjs/core';
import { setupApplication, startApplication } from '@project/shared-config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApplication(app, {
    title: 'Readme — Blog Service',
    description: 'REST API сервиса публикаций',
  });

  await startApplication(app, 'Blog Service');
}

void bootstrap();
