import { Injectable } from '@nestjs/common';
import { Comment } from '@project/shared-types';
import type { PaginationResult } from '@project/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_LIMIT } from './comment.constant';
import type { CommentQuery } from './comment-query.type';

type CommentRecord = {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: Date;
};

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: CommentRecord): Comment {
    const comment = new Comment();
    comment.id = record.id;
    comment.postId = record.postId;
    comment.authorId = record.authorId;
    comment.text = record.text;
    comment.createdAt = record.createdAt;
    return comment;
  }

  public async findByPostId(
    postId: string,
    query: CommentQuery = {},
  ): Promise<PaginationResult<Comment>> {
    const { limit = DEFAULT_LIMIT, page = 1 } = query;

    const [totalItems, records] = await this.prisma.$transaction([
      this.prisma.comment.count({ where: { postId } }),
      this.prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      entities: records.map((record) => this.toDomain(record)),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  public async findById(id: string): Promise<Comment | null> {
    const record = await this.prisma.comment.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async save(comment: Comment): Promise<Comment> {
    const record = await this.prisma.comment.create({
      data: {
        postId: comment.postId,
        authorId: comment.authorId,
        text: comment.text,
      },
    });
    return this.toDomain(record);
  }

  public async deleteById(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  public async deleteByPostId(postId: string): Promise<void> {
    await this.prisma.comment.deleteMany({ where: { postId } });
  }
}
