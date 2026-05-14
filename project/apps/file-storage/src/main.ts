import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Readme — File Storage Service')
    .setDescription('REST API сервиса хранения файлов')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('spec', app, document);

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  Logger.log(`🚀 File Storage:  http://localhost:${port}/api`);
  Logger.log(`📖 Swagger UI:   http://localhost:${port}/spec`);
}

bootstrap();
