import {
  IsEnum,
  IsInt,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
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
  public APPLICATION_PORT: number = 3004;

  @IsString()
  @MinLength(1)
  public POSTGRES_HOST!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  public POSTGRES_PORT!: number;

  @IsString()
  @MinLength(1)
  public POSTGRES_USER!: string;

  @IsString()
  @MinLength(1)
  public POSTGRES_PASSWORD!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public POSTGRES_DB!: string;

  @IsString()
  @MinLength(1)
  public UPLOAD_DIRECTORY_PATH!: string;

  // Корень для статики должен начинаться с `/` (префикс URL-пути).
  @IsString()
  @Matches(/^\//)
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
