import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
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
    // Перебрасываем как обычное HttpException — дальше отработает стандартный механизм Nest
    const response = host.switchToHttp().getResponse();
    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }

  private toHttpException(error: DomainError): HttpException {
    if (error instanceof EntityNotFoundError)
      return new NotFoundException(error.message);
    if (error instanceof AccessDeniedError)
      return new ForbiddenException(error.message);
    if (error instanceof BusinessRuleViolationError)
      return new ConflictException(error.message);
    if (error instanceof AuthenticationFailedError)
      return new UnauthorizedException(error.message);
    // fallback — на всякий случай
    return new HttpException(error.message, 500);
  }
}
