import { registerAs } from '@nestjs/config';

export interface MongoConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  authBase: string;
}

export const MONGO_CONFIG_NAMESPACE = 'mongo';

export const mongoConfig = registerAs(
  MONGO_CONFIG_NAMESPACE,
  (): MongoConfig => ({
    host: process.env.MONGO_HOST as string,
    port: Number(process.env.MONGO_PORT),
    user: process.env.MONGO_USER as string,
    password: process.env.MONGO_PASSWORD as string,
    database: process.env.MONGO_DATABASE as string,
    authBase: process.env.MONGO_AUTH_BASE as string,
  }),
);
