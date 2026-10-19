import { AuthenticationFailedError } from '@project/shared-errors';

export class InvalidPasswordError extends AuthenticationFailedError {
  constructor() {
    super('Неверный пароль');
  }
}

/**
 * Вход с неизвестным email или неверным паролем. Причина намеренно одна:
 * разные ответы позволили бы перебором узнать, какие адреса зарегистрированы.
 */
export class InvalidCredentialsError extends AuthenticationFailedError {
  constructor() {
    super('Неверный email или пароль');
  }
}

export class InvalidRefreshTokenError extends AuthenticationFailedError {
  constructor() {
    super('Недействительный refresh-токен');
  }
}
