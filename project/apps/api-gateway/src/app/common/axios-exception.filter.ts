import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AxiosExceptionFilter.name);

  public catch(error: AxiosError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (error.response) {
      const status = error.response.status;
      const body = error.response.data;
      this.logger.warn(
        `Downstream ${request.method} ${request.url} → ${status}`,
      );
      response.status(status).json(body);
      return;
    }

    this.logger.error(
      `Downstream ${request.method} ${request.url} unreachable: ${error.message}`,
    );
    response
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Сервис временно недоступен',
        error: 'Service Unavailable',
      });
  }
}
