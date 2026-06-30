import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from '@project/shared-errors';
import { AppModule } from './app/app.module';
import { getRabbitmqConnectionString } from './app/helpers/rabbitmq.helpers';
import type { RabbitmqConfig } from './app/config';

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
  app.useGlobalFilters(new DomainExceptionFilter());

  const configService = app.get(ConfigService);
  const rabbitmq = configService.getOrThrow<RabbitmqConfig>('rabbitmq');

  // RabbitMQ consumer: входящие события от других сервисов. noAck=true —
  // внутренние события доставляются «не более одного раза», без повторной
  // постановки в очередь (исключаем зацикливание на «плохих» сообщениях).
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [getRabbitmqConnectionString(rabbitmq)],
      queue: rabbitmq.queue,
      queueOptions: { durable: true },
      noAck: true,
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Readme — Notify Service')
    .setDescription(
      'Сервис почтовых уведомлений: RabbitMQ-консьюмер + HTTP-триггер рассылки',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('spec', app, document);

  await app.startAllMicroservices();

  const port = configService.get<number>('application.port', 3003);
  await app.listen(port);
  Logger.log(`🚀 Notify Service: http://localhost:${port}/api`);
  Logger.log(`📖 Swagger UI:     http://localhost:${port}/spec`);
  Logger.log(`📨 RabbitMQ queue: ${rabbitmq.queue}`);
}

bootstrap();
