import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { validateEnvironment } from '@project/shared-config';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  public APPLICATION_NODE_ENV: Environment = Environment.Development;

  // Явный тип `: number` обязателен: под SWC он задаёт design:type = Number,
  // чтобы enableImplicitConversion привёл строку из .env к числу (см. AGENTS.md → Gotchas).
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsInt()
  @Min(0)
  @Max(65535)
  public APPLICATION_PORT: number = 3002;

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
  public RABBITMQ_HOST!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  public RABBITMQ_PORT!: number;

  @IsString()
  @MinLength(1)
  public RABBITMQ_USER!: string;

  @IsString()
  @MinLength(1)
  public RABBITMQ_PASSWORD!: string;

  @IsString()
  @MinLength(1)
  public RABBITMQ_QUEUE!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateEnvironment(EnvironmentVariables, config);
}
