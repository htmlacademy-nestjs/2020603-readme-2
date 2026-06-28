import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '@project/shared-errors';

export class SubscriptionAlreadyExistsError extends BusinessRuleViolationError {
  constructor(followingId: string) {
    super(`Подписка на пользователя "${followingId}" уже оформлена`);
  }
}

export class SubscriptionNotFoundError extends EntityNotFoundError {
  constructor(followingId: string) {
    super(`Подписка на пользователя "${followingId}" не найдена`);
  }
}

export class SelfSubscriptionError extends BusinessRuleViolationError {
  constructor() {
    super('Нельзя подписаться на самого себя');
  }
}
