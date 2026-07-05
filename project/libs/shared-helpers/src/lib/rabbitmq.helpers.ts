import type { RabbitmqConfig } from '@project/shared-config';

export function getRabbitmqConnectionString(config: RabbitmqConfig): string {
  const { user, password, host, port } = config;
  const credentials = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  return `amqp://${credentials}@${host}:${port}`;
}
