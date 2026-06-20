import { Injectable } from '@nestjs/common';
import type { Like } from '@project/shared-types';
import { PrismaService } from '../prisma/prisma.service';

type LikeRecord = {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
};

@Injectable()
export class LikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: LikeRecord): Like {
    return {
      id: record.id,
      postId: record.postId,
      userId: record.userId,
      createdAt: record.createdAt,
    };
  }

  public async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<Like | null> {
    const record = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return record ? this.toDomain(record) : null;
  }

  public async save(postId: string, userId: string): Promise<Like> {
    const record = await this.prisma.like.create({
      data: { postId, userId },
    });
    return this.toDomain(record);
  }

  public async deleteByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.like.deleteMany({ where: { postId, userId } });
  }
}
