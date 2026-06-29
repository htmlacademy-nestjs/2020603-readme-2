import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const usersRoot = import.meta.dirname;
loadEnv({ path: path.join(usersRoot, '.env') });

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
} = process.env;

export default defineConfig({
  schema: path.join(usersRoot, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(usersRoot, 'prisma', 'migrations'),
    seed: 'tsx apps/users/prisma/seed.ts',
  },
  datasource: {
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  },
});
