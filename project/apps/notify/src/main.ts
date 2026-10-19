import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import type { MicroserviceOptions } from '@nestjs/microservices';
import {
  rabbitmqConfig,
  setupApplication,
  startApplication,
} from '@project/shared-config';
import type { RabbitmqConfig } from '@project/shared-config';
import { getRabbitmqConnectionString } from '@project/shared-helpers';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApplication(app, {
    title: 'Readme — Notify Service',
    description:
      'Сервис почтовых уведомлений: RabbitMQ-консьюмер + HTTP-триггер рассылки',
  });

  const rabbitmq = app.get<RabbitmqConfig>(rabbitmqConfig.KEY);

  // RabbitMQ consumer: входящие события от других сервисов. noAck=true —
  // внутренние события доставляются «не более одного раза», без повторной
  // постановки в очередь (исключаем зацикливание на «плохих» сообщениях).
  // inheritAppConfig: глобальный ValidationPipe проверяет и payload событий.
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [getRabbitmqConnectionString(rabbitmq)],
        queue: rabbitmq.queue,
        queueOptions: { durable: true },
        noAck: true,
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();

  await startApplication(app, 'Notify Service');
  Logger.log(`📨 RabbitMQ queue: ${rabbitmq.queue}`);
}

void bootstrap();
