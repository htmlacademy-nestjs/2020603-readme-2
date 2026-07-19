import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from '@project/shared-errors';
import { AppModule } from './app/app.module.js';
import { AxiosExceptionFilter } from './app/common/axios-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new AxiosExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Readme — API Gateway')
    .setDescription('Единая точка входа для фронтенда: аутентификация, проксирование и агрегация данных микросервисов')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('spec', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('application.port', 3005);
  await app.listen(port);
  Logger.log(`🚀 API Gateway:  http://localhost:${port}/api`);
  Logger.log(`📖 Swagger UI:   http://localhost:${port}/spec`);
}

bootstrap();
