import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  environment: string;
}

export const APP_CONFIG_NAMESPACE = 'application';

export const appConfig = registerAs(
  APP_CONFIG_NAMESPACE,
  (): AppConfig => ({
    port: Number(process.env.PORT),
    environment: process.env.NODE_ENV as string,
  }),
);
