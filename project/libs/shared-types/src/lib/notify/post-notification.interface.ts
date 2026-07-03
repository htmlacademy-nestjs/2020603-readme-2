import { PostType } from '../post/post-type.enum.js';

/**
 * Payload события `add.post`: данные новой публикации, которые сервис блога
 * публикует в очередь notify при создании поста/репоста. `publishedAt`
 * сериализуется в JSON как ISO-строка — консьюмер коэрсит её обратно в `Date`.
 */
export interface PostNotification {
  postId: string;
  title?: string;
  type: PostType;
  authorId: string;
  publishedAt: Date;
}
