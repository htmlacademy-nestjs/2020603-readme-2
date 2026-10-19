import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AccessDeniedError,
  AuthenticationFailedError,
  BusinessRuleViolationError,
  DomainError,
  EntityNotFoundError,
} from './base-errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const httpException = this.toHttpException(error);
    // Ответ в формате стандартного HttpException Nest: статус и тело берём из него
    const response = host.switchToHttp().getResponse();
    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }

  private toHttpException(error: DomainError): HttpException {
    if (error instanceof EntityNotFoundError) {
      return new NotFoundException(error.message);
    }
    if (error instanceof AccessDeniedError) {
      return new ForbiddenException(error.message);
    }
    if (error instanceof BusinessRuleViolationError) {
      return new ConflictException(error.message);
    }
    if (error instanceof AuthenticationFailedError) {
      return new UnauthorizedException(error.message);
    }
    // Доменная ошибка без HTTP-соответствия — внутренняя ошибка сервера
    return new InternalServerErrorException(error.message);
  }
}
