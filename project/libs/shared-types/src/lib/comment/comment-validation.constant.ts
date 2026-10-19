/** Ограничения текста комментария (§6.2). */
export const CommentValidation = {
  Text: { MinLength: 10, MaxLength: 300 },
} as const;

/** Размер страницы списка комментариев (§6.5). */
export const CommentListLimit = {
  Default: 50,
  Max: 50,
} as const;
