export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Сущность не найдена
export abstract class EntityNotFoundError extends DomainError {}

// Действие запрещено бизнес-правилами
export abstract class AccessDeniedError extends DomainError {}

// Операция нарушает инварианты/уникальность
export abstract class BusinessRuleViolationError extends DomainError {}

// Ошибка аутентификации (не подтверждена личность)
export abstract class AuthenticationFailedError extends DomainError {}
