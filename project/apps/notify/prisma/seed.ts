import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { postgresConfig } from '@project/shared-config';
import { getPostgresConnectionString } from '@project/shared-helpers';
import { PrismaClient } from '../src/generated/prisma/client.js';

loadEnv({ path: path.join(import.meta.dirname, '..', '.env') });

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: getPostgresConnectionString(postgresConfig()),
  }),
});

async function clean(): Promise<void> {
  await prisma.notifyPost.deleteMany();
  await prisma.emailSubscriber.deleteMany();
}

async function main(): Promise<void> {
  await clean();

  // Demo subscribers mirror the users service seed, so the newsletter can be
  // tested without first publishing subscriber events over RabbitMQ.
  await prisma.emailSubscriber.createMany({
    data: [
      {
        userId: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
        email: 'ivan@example.com',
        name: 'Иван Иванов',
      },
      {
        userId: '9c8e7b6a-5f4d-43c2-9a1b-0e9d8c7b6a52',
        email: 'maria@example.com',
        name: 'Мария Петрова',
      },
      {
        userId: 'a1d2c3b4-5e6f-47a8-9b0c-1d2e3f4a5b6c',
        email: 'pavel@example.com',
        name: 'Павел Сидоров',
      },
    ],
  });

  console.log('Notify seed complete:', { subscribers: 3 });
}

// tsx исполняет сид как CommonJS (в apps/<app>/package.json нет "type": "module"),
// поэтому await верхнего уровня недоступен — запуск идёт через функцию.
async function run(): Promise<void> {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void run();
