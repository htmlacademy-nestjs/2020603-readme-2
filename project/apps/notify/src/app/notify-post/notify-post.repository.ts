import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePostNotificationDto } from './dto/create-post-notification.dto';
import type { NotifyPostEntity } from './notify-post.entity';

@Injectable()
export class NotifyPostRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async upsert(
    dto: CreatePostNotificationDto,
  ): Promise<NotifyPostEntity> {
    const data = {
      postId: dto.postId,
      title: dto.title ?? null,
      type: dto.type,
      authorId: dto.authorId,
      // Событие приходит JSON-ом (publishedAt — ISO-строка); приводим к Date.
      publishedAt: new Date(dto.publishedAt),
    };

    return this.prisma.notifyPost.upsert({
      where: { postId: dto.postId },
      update: data,
      create: data,
    });
  }

  /** Публикации, по которым рассылка ещё не выполнялась (§7.3). */
  public async findPending(): Promise<NotifyPostEntity[]> {
    return this.prisma.notifyPost.findMany({
      where: { notifiedAt: null },
      orderBy: { publishedAt: 'asc' },
    });
  }

  public async markNotified(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await this.prisma.notifyPost.updateMany({
      where: { id: { in: ids } },
      data: { notifiedAt: new Date() },
    });
  }
}
