import {
  IsEnum,
  IsInt,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Environment, validateEnvironment } from '@project/shared-config';

export class EnvironmentVariables {
  @IsEnum(Environment)
  public APPLICATION_NODE_ENV: Environment = Environment.Development;

  // Явный тип `: number` обязателен: под SWC он задаёт design:type = Number,
  // чтобы enableImplicitConversion привёл строку из .env к числу (см. AGENTS.md → Gotchas).
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsInt()
  @Min(0)
  @Max(65535)
  public APPLICATION_PORT: number = 3005;

  // Секрет доступа дублируется из users: gateway проверяет JWT локально.
  @IsString()
  @MinLength(32)
  public JWT_ACCESS_TOKEN_SECRET!: string;

  // require_tld: false + require_protocol: true — пропускают localhost-URL сервисов.
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  public USERS_SERVICE_URL!: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  public BLOG_SERVICE_URL!: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  public FILE_STORAGE_SERVICE_URL!: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  public NOTIFY_SERVICE_URL!: string;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsInt()
  @Min(0)
  public HTTP_CLIENT_TIMEOUT: number = 5000;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateEnvironment(EnvironmentVariables, config);
}
