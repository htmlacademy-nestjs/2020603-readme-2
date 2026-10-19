/**
 * Ручная публикация событий в очередь notify для проверки консьюмера без
 * сервисов `users`/`blog`. Конверт `{ pattern, data }` — формат, который ожидает
 * транспорт RabbitMQ из @nestjs/microservices для событий (ClientProxy.emit).
 *
 * Запуск (из каталога project/):
 *   npx tsx --tsconfig tsconfig.scripts.json apps/notify/tools/rabbit-publish.ts
 */
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { connect } from 'amqplib';
import { rabbitmqConfig } from '@project/shared-config';
import { getRabbitmqConnectionString } from '@project/shared-helpers';
import { PostType, RabbitRouting } from '@project/shared-types';
import type {
  PostPublishedEvent,
  UserRegisteredEvent,
} from '@project/shared-types';

loadEnv({ path: path.join(import.meta.dirname, '..', '.env') });

function createMessage(pattern: RabbitRouting, data: unknown): Buffer {
  return Buffer.from(JSON.stringify({ pattern, data }));
}

async function main(): Promise<void> {
  const config = rabbitmqConfig();
  const connection = await connect(getRabbitmqConnectionString(config));
  const channel = await connection.createChannel();
  await channel.assertQueue(config.queue, { durable: true });

  const subscriber: UserRegisteredEvent = {
    userId: randomUUID(),
    email: `demo-${Date.now()}@example.com`,
    name: 'Демо Подписчик',
  };
  channel.sendToQueue(
    config.queue,
    createMessage(RabbitRouting.UserRegistered, subscriber),
  );

  const post: PostPublishedEvent = {
    postId: randomUUID(),
    title: 'Тестовая публикация для рассылки',
    type: PostType.Text,
    authorId: randomUUID(),
    publishedAt: new Date(),
  };
  channel.sendToQueue(
    config.queue,
    createMessage(RabbitRouting.PostPublished, post),
  );

  console.log('Published events to queue:', config.queue);
  console.log(`  ${RabbitRouting.UserRegistered}:`, subscriber.email);
  console.log(`  ${RabbitRouting.PostPublished}:`, post.postId);

  await channel.close();
  await connection.close();
}

// tsx исполняет скрипт как CommonJS (в apps/notify/package.json нет "type": "module"),
// поэтому await верхнего уровня недоступен — запуск идёт через функцию.
async function run(): Promise<void> {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

void run();
