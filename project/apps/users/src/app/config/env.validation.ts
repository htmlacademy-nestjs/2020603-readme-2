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

  @IsInt()
  @Min(0)
  @Max(65535)
  public APPLICATION_PORT: number = 3001;

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
  return validateEnvironment(EnvironmentVariables, config);
}
