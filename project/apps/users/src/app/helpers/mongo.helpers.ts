import type { MongoConfig } from '../config';

export function getMongoConnectionString(config: MongoConfig): string {
  const { user, password, host, port, database, authBase } = config;
  const credentials = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  return `mongodb://${credentials}@${host}:${port}/${database}?authSource=${authBase}`;
}
