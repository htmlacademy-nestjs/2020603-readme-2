import { NestFactory } from '@nestjs/core';
import { setupApplication, startApplication } from '@project/shared-config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApplication(app, {
    title: 'Readme — Users Service',
    description: 'REST API сервиса пользователей',
  });

  await startApplication(app, 'Users Service');
}

void bootstrap();
