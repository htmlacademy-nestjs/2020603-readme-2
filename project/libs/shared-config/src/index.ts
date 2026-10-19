export { validateEnvironment } from './lib/validate-environment';
export { Environment } from './lib/environment';
export {
  BaseEnvironment,
  PostgresEnvironment,
  PostgresRabbitmqEnvironment,
  PortRange,
  JWT_SECRET_MIN_LENGTH,
} from './lib/environment.schema';
export {
  ApplicationPath,
  createValidationPipe,
  setupApplication,
  startApplication,
} from './lib/application.setup';
export type { SwaggerOptions } from './lib/application.setup';
export { appConfig, APP_CONFIG_NAMESPACE } from './lib/app.config';
export {
  postgresConfig,
  POSTGRES_CONFIG_NAMESPACE,
} from './lib/postgres.config';
export {
  rabbitmqConfig,
  RABBITMQ_CONFIG_NAMESPACE,
} from './lib/rabbitmq.config';
export type { AppConfig } from './lib/app.config';
export type { PostgresConfig } from './lib/postgres.config';
export type { RabbitmqConfig } from './lib/rabbitmq.config';
