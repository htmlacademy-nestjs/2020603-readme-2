import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const notifyRoot = import.meta.dirname;
loadEnv({ path: path.join(notifyRoot, '.env') });

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
} = process.env;

export default defineConfig({
  schema: path.join(notifyRoot, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(notifyRoot, 'prisma', 'migrations'),
    seed: 'tsx apps/notify/prisma/seed.ts',
  },
  datasource: {
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  },
});
