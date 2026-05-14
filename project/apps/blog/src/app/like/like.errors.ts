import { BusinessRuleViolationError } from '@project/shared-errors';

export class LikeAlreadyExistsError extends BusinessRuleViolationError {
  constructor(postId: string) {
    super(`Лайк для публикации "${postId}" уже поставлен этим пользователем`);
  }
}
