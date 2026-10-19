import {
  PostgresRabbitmqEnvironment,
  validateEnvironment,
} from '@project/shared-config';

// Blog — база PostgreSQL и продюсер событий post.published/post.unpublished:
// собственных переменных сверх общей схемы у сервиса нет.
export function validateEnv(
  config: Record<string, unknown>,
): PostgresRabbitmqEnvironment {
  return validateEnvironment(PostgresRabbitmqEnvironment, config);
}
