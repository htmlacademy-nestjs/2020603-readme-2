import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '@project/shared-errors';

export class LikeAlreadyExistsError extends BusinessRuleViolationError {
  constructor(postId: string) {
    super(`Лайк для публикации "${postId}" уже поставлен этим пользователем`);
  }
}

export class LikeNotFoundError extends EntityNotFoundError {
  constructor(postId: string) {
    super(`Лайк для публикации "${postId}" этим пользователем не поставлен`);
  }
}
