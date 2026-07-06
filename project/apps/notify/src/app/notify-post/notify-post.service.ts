import { Injectable, Logger } from '@nestjs/common';
import { NotifyPostRepository } from './notify-post.repository';
import type { CreatePostNotificationDto } from './dto/create-post-notification.dto';
import type { NotifyPostEntity } from './notify-post.entity';

@Injectable()
export class NotifyPostService {
  private readonly logger = new Logger(NotifyPostService.name);

  constructor(private readonly repository: NotifyPostRepository) {}

  public async addPost(
    dto: CreatePostNotificationDto,
  ): Promise<NotifyPostEntity> {
    const post = await this.repository.upsert(dto);
    this.logger.log(`Post queued for newsletter: ${post.postId}`);
    return post;
  }

  public async getPendingPosts(): Promise<NotifyPostEntity[]> {
    return this.repository.findPending();
  }

  public async markNotified(ids: string[]): Promise<void> {
    await this.repository.markNotified(ids);
  }
}
