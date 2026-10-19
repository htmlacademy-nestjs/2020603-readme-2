import { IsInt, IsString, IsUrl, Min, MinLength } from 'class-validator';
import {
  BaseEnvironment,
  JWT_SECRET_MIN_LENGTH,
  validateEnvironment,
} from '@project/shared-config';

// require_tld: false + require_protocol: true — пропускают localhost-URL сервисов.
const SERVICE_URL_OPTIONS: Parameters<typeof IsUrl>[0] = {
  protocols: ['http', 'https'],
  require_protocol: true,
  require_tld: false,
};

const DEFAULT_HTTP_CLIENT_TIMEOUT = 5000;
const MIN_HTTP_CLIENT_TIMEOUT = 0;

export class EnvironmentVariables extends BaseEnvironment {
  // Секрет доступа дублируется из users: gateway проверяет JWT локально.
  @IsString()
  @MinLength(JWT_SECRET_MIN_LENGTH)
  public JWT_ACCESS_TOKEN_SECRET!: string;

  @IsUrl(SERVICE_URL_OPTIONS)
  public USERS_SERVICE_URL!: string;

  @IsUrl(SERVICE_URL_OPTIONS)
  public BLOG_SERVICE_URL!: string;

  @IsUrl(SERVICE_URL_OPTIONS)
  public FILE_STORAGE_SERVICE_URL!: string;

  @IsUrl(SERVICE_URL_OPTIONS)
  public NOTIFY_SERVICE_URL!: string;

  // Явный тип `: number` обязателен: он задаёт design:type = Number для
  // приведения строки из .env к числу.
  @IsInt()
  @Min(MIN_HTTP_CLIENT_TIMEOUT)
  public HTTP_CLIENT_TIMEOUT: number = DEFAULT_HTTP_CLIENT_TIMEOUT;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateEnvironment(EnvironmentVariables, config);
}
