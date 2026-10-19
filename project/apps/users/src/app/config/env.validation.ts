import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  JWT_SECRET_MIN_LENGTH,
  PostgresRabbitmqEnvironment,
  validateEnvironment,
} from '@project/shared-config';

// RabbitMQ — продюсер события `user.registered` для сервиса notify.
export class EnvironmentVariables extends PostgresRabbitmqEnvironment {
  @IsString()
  @MinLength(JWT_SECRET_MIN_LENGTH)
  public JWT_ACCESS_TOKEN_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  public JWT_ACCESS_TOKEN_EXPIRES_IN!: string;

  @IsString()
  @MinLength(JWT_SECRET_MIN_LENGTH)
  public JWT_REFRESH_TOKEN_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  public JWT_REFRESH_TOKEN_EXPIRES_IN!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateEnvironment(EnvironmentVariables, config);
}
