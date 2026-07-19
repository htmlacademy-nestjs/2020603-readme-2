import { AuthenticationFailedError } from '@project/shared-errors';

export class TokenNotProvidedError extends AuthenticationFailedError {
  constructor() {
    super('Токен доступа не передан');
  }
}

export class InvalidTokenError extends AuthenticationFailedError {
  constructor() {
    super('Недействительный токен доступа');
  }
}
