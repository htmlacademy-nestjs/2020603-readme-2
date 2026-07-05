import { registerAs } from '@nestjs/config';

export interface RabbitmqConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  queue: string;
}

export const RABBITMQ_CONFIG_NAMESPACE = 'rabbitmq';

export const rabbitmqConfig = registerAs(
  RABBITMQ_CONFIG_NAMESPACE,
  (): RabbitmqConfig => ({
    host: process.env.RABBITMQ_HOST as string,
    port: Number(process.env.RABBITMQ_PORT),
    user: process.env.RABBITMQ_USER as string,
    password: process.env.RABBITMQ_PASSWORD as string,
    queue: process.env.RABBITMQ_QUEUE as string,
  }),
);
