
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateSync } from 'class-validator';

/**
 * Универсальная валидация переменных окружения для сервисов монорепозитория.
 *
 * @param schema класс со схемой ENV (декораторы class-validator)
 * @param config сырой объект process.env
 * @returns провалидированный и приведённый к типам инстанс схемы
 * @throws Error со списком проблем, если валидация не прошла
 */
export function validateEnvironment<T extends object>(
  schema: ClassConstructor<T>,
  config: Record<string, unknown>,
): T {
  const validatedConfig = plainToInstance(schema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig as object, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => `  - ${error.toString()}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${errorMessages}`);
  }

  return validatedConfig;
}
