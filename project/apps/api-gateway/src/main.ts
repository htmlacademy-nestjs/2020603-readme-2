import { NestFactory } from '@nestjs/core';
import { setupApplication, startApplication } from '@project/shared-config';
import { AppModule } from './app/app.module.js';
import { AxiosExceptionFilter } from './app/common/axios-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApplication(app, {
    title: 'Readme — API Gateway',
    description:
      'Единая точка входа для фронтенда: аутентификация, проксирование и агрегация данных микросервисов',
    hasBearerAuth: true,
  });
  app.useGlobalFilters(new AxiosExceptionFilter());

  await startApplication(app, 'API Gateway');
}

void bootstrap();
