import { registerAs } from '@nestjs/config';

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const POSTGRES_CONFIG_NAMESPACE = 'postgres';

export const postgresConfig = registerAs(
  POSTGRES_CONFIG_NAMESPACE,
  (): PostgresConfig => ({
    host: process.env.POSTGRES_HOST as string,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER as string,
    password: process.env.POSTGRES_PASSWORD as string,
    database: process.env.POSTGRES_DB as string,
  }),
);
