import {
  EntityNotFoundError,
  AccessDeniedError,
} from '@project/shared-errors';

export class CommentNotFoundError extends EntityNotFoundError {
  constructor(commentId: string) {
    super(`Комментарий с id "${commentId}" не найден`);
  }
}

export class CommentDeleteForbiddenError extends AccessDeniedError {
  constructor() {
    super('Удалять можно только свои комментарии');
  }
}
