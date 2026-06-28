import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Prisma 7 НЕ читает .env сам — грузим .env сервиса Blog явно.
// Пути считаем от расположения файла, поэтому команды можно запускать из project/
// с флагом --config apps/blog/prisma.config.ts независимо от CWD.
const blogRoot = import.meta.dirname;
loadEnv({ path: path.join(blogRoot, '.env') });

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB } =
  process.env;

export default defineConfig({
  schema: path.join(blogRoot, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(blogRoot, 'prisma', 'migrations'),
    // запуск seed-скрипта (`prisma db seed` и автоматически после `migrate reset`)
    seed: 'tsx apps/blog/prisma/seed.ts',
  },
  datasource: {
    // строка подключения только для CLI (migrate/db); рантайм использует driver adapter
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  },
});
