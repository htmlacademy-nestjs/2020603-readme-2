import { Logger, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from '@project/shared-errors';
import { appConfig } from './app.config';
import type { AppConfig } from './app.config';

/** Пути HTTP-приложения: префикс REST API и документация OpenAPI. */
export const ApplicationPath = {
  GlobalPrefix: 'api',
  Swagger: 'spec',
} as const;

const SWAGGER_DOCUMENT_VERSION = '1.0';

export interface SwaggerOptions {
  title: string;
  description: string;
  hasBearerAuth?: boolean;
}

/**
 * Строгая валидация входных данных: лишние поля запрещены, полный список
 * ошибок уходит клиенту (§1.3), строки запроса приводятся к типам DTO.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
    validationError: {
      target: false,
      value: false,
    },
  });
}

/** Общая настройка HTTP-сервиса: префикс, валидация, доменные ошибки, Swagger. */
export function setupApplication(
  app: INestApplication,
  swagger: SwaggerOptions,
): void {
  app.setGlobalPrefix(ApplicationPath.GlobalPrefix);
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new DomainExceptionFilter());

  const documentBuilder = new DocumentBuilder()
    .setTitle(swagger.title)
    .setDescription(swagger.description)
    .setVersion(SWAGGER_DOCUMENT_VERSION);
  if (swagger.hasBearerAuth) {
    documentBuilder.addBearerAuth();
  }
  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  SwaggerModule.setup(ApplicationPath.Swagger, app, document);
}

/** Запускает HTTP-сервер на порту из конфигурации и пишет адреса в лог. */
export async function startApplication(
  app: INestApplication,
  serviceName: string,
): Promise<void> {
  const { port } = app.get<AppConfig>(appConfig.KEY);
  await app.listen(port);
  Logger.log(
    `🚀 ${serviceName}: http://localhost:${port}/${ApplicationPath.GlobalPrefix}`,
  );
  Logger.log(
    `📖 Swagger UI: http://localhost:${port}/${ApplicationPath.Swagger}`,
  );
}
