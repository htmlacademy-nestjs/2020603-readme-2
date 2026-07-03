import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitRouting } from '@project/shared-types';
import type { Post, PostNotification } from '@project/shared-types';
import { NOTIFY_CLIENT } from './notify-client.constant';

@Injectable()
export class NotifyClientService {
  constructor(
    @Inject(NOTIFY_CLIENT) private readonly client: ClientProxy,
  ) {}

  /**
   * Публикует событие о новой публикации в очередь notify. `emit()` в Nest —
   * hot observable (сам вызывает `.connect()`), поэтому дополнительный
   * `subscribe`/`await` не нужен; `amqp-connection-manager` буферизует и
   * переподключается, так что создание поста не падает при недоступном брокере.
   */
  public publishNewPost(post: Post): void {
    this.client.emit(RabbitRouting.AddPost, {
      postId: post.id,
      title: 'title' in post ? post.title : undefined,
      type: post.type,
      authorId: post.authorId,
      publishedAt: post.publishedAt,
    } satisfies PostNotification);
  }
}
