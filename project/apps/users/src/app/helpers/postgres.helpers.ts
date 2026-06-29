import type { PostgresConfig } from '../config';

export function getPostgresConnectionString(config: PostgresConfig): string {
  const { user, password, host, port, database } = config;
  const credentials = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  return `postgresql://${credentials}@${host}:${port}/${database}`;
}
