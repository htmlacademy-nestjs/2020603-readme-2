import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';
import {
  PostgresEnvironment,
  validateEnvironment,
} from '@project/shared-config';

// Корень для статики — префикс URL-пути, поэтому начинается с `/`.
const STATIC_SERVE_ROOT_PATTERN = /^\//;

export class EnvironmentVariables extends PostgresEnvironment {
  @IsString()
  @IsNotEmpty()
  public UPLOAD_DIRECTORY_PATH!: string;

  @IsString()
  @Matches(STATIC_SERVE_ROOT_PATTERN)
  public STATIC_SERVE_ROOT!: string;

  // require_tld: false обязательно, иначе localhost не пройдёт валидацию.
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  public STATIC_BASE_URL!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateEnvironment(EnvironmentVariables, config);
}
