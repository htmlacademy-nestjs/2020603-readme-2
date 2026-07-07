import path from 'node:path';
import { registerAs } from '@nestjs/config';

export interface StorageConfig {
  uploadDirectory: string;
  serveRoot: string;
  baseUrl: string;
}

export const STORAGE_CONFIG_NAMESPACE = 'storage';

const trimTrailingSlash = (value: string): string =>
  value.replace(/\/+$/, '');

export const storageConfig = registerAs(
  STORAGE_CONFIG_NAMESPACE,
  (): StorageConfig => ({
    // cwd-относительный путь: nx serve работает с cwd = project/.
    // Абсолютные пути из .env проходят через path.resolve как есть.
    uploadDirectory: path.resolve(
      process.cwd(),
      process.env.UPLOAD_DIRECTORY_PATH ?? 'apps/file-storage/uploads',
    ),
    serveRoot: process.env.STATIC_SERVE_ROOT ?? '/static',
    baseUrl: trimTrailingSlash(
      process.env.STATIC_BASE_URL ?? 'http://localhost:3004',
    ),
  }),
);
