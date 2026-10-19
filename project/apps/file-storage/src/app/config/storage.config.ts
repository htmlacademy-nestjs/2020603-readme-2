import path from 'node:path';
import { registerAs } from '@nestjs/config';

export interface StorageConfig {
  uploadDirectory: string;
  serveRoot: string;
  baseUrl: string;
}

export const STORAGE_CONFIG_NAMESPACE = 'storage';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const storageConfig = registerAs(
  STORAGE_CONFIG_NAMESPACE,
  (): StorageConfig => ({
    // cwd-относительный путь: nx serve работает с cwd = project/.
    // Абсолютные пути из .env проходят через path.resolve как есть.
    // Все три переменные обязательны в схеме env.validation.ts, поэтому
    // значения по умолчанию здесь не нужны.
    uploadDirectory: path.resolve(
      process.cwd(),
      process.env.UPLOAD_DIRECTORY_PATH as string,
    ),
    serveRoot: process.env.STATIC_SERVE_ROOT as string,
    baseUrl: trimTrailingSlash(process.env.STATIC_BASE_URL as string),
  }),
);
