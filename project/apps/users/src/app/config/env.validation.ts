import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  public NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(0)
  @Max(65535)
  public PORT: number = 3001;

  @IsString()
  @MinLength(1)
  public MONGO_HOST!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  public MONGO_PORT!: number;

  @IsString()
  @MinLength(1)
  public MONGO_USER!: string;

  @IsString()
  @MinLength(1)
  public MONGO_PASSWORD!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public MONGO_DATABASE!: string;

  @IsString()
  @MinLength(1)
  public MONGO_AUTH_BASE!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((err) => `  - ${err.toString()}`)
        .join('\n')}`,
    );
  }

  return validatedConfig;
}
