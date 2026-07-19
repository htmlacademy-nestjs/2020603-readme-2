import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const fileStorageRoot = import.meta.dirname;
loadEnv({ path: path.join(fileStorageRoot, '.env') });

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
} = process.env;

export default defineConfig({
  schema: path.join(fileStorageRoot, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(fileStorageRoot, 'prisma', 'migrations'),
  },
  datasource: {
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  },
});
