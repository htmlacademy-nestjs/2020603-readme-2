import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import {
  PortRange,
  PostgresRabbitmqEnvironment,
  validateEnvironment,
} from '@project/shared-config';

export class EnvironmentVariables extends PostgresRabbitmqEnvironment {
  @IsString()
  @IsNotEmpty()
  public MAIL_SMTP_HOST!: string;

  @IsInt()
  @Min(PortRange.Min)
  @Max(PortRange.Max)
  public MAIL_SMTP_PORT!: number;

  @IsString()
  @IsNotEmpty()
  public MAIL_FROM!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateEnvironment(EnvironmentVariables, config);
}
