import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Environment } from './environment';

/** Допустимый диапазон TCP-портов. */
export const PortRange = {
  Min: 0,
  Max: 65535,
} as const;

/** Минимальная длина секрета подписи JWT (HS256 — от 256 бит). */
export const JWT_SECRET_MIN_LENGTH = 32;

const POSTGRES_DATABASE_NAME_MAX_LENGTH = 64;

// Явный тип `: number` у числовых переменных обязателен: он задаёт
// design:type = Number, и enableImplicitConversion приводит строку из .env к числу.

/** Переменные, которые нужны любому сервису. */
export class BaseEnvironment {
  @IsEnum(Environment)
  public APPLICATION_NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(PortRange.Min)
  @Max(PortRange.Max)
  public APPLICATION_PORT!: number;
}

/** Сервис с собственной базой PostgreSQL. */
export class PostgresEnvironment extends BaseEnvironment {
  @IsString()
  @IsNotEmpty()
  public POSTGRES_HOST!: string;

  @IsInt()
  @Min(PortRange.Min)
  @Max(PortRange.Max)
  public POSTGRES_PORT!: number;

  @IsString()
  @IsNotEmpty()
  public POSTGRES_USER!: string;

  @IsString()
  @IsNotEmpty()
  public POSTGRES_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(POSTGRES_DATABASE_NAME_MAX_LENGTH)
  public POSTGRES_DB!: string;
}

/** Сервис с базой PostgreSQL и подключением к RabbitMQ (очередь notify). */
export class PostgresRabbitmqEnvironment extends PostgresEnvironment {
  @IsString()
  @IsNotEmpty()
  public RABBITMQ_HOST!: string;

  @IsInt()
  @Min(PortRange.Min)
  @Max(PortRange.Max)
  public RABBITMQ_PORT!: number;

  @IsString()
  @IsNotEmpty()
  public RABBITMQ_USER!: string;

  @IsString()
  @IsNotEmpty()
  public RABBITMQ_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  public RABBITMQ_QUEUE!: string;
}
