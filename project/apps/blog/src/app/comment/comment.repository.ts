import { Injectable } from '@nestjs/common';
import { Comment, CommentListLimit, Pagination } from '@project/shared-types';
import type { PaginationQuery, PaginationResult } from '@project/shared-types';
import { createPaginationResult } from '@project/shared-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { NOT_DELETED } from '../prisma/soft-delete.constant';

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
    query: PaginationQuery = {},
  ): Promise<PaginationResult<Comment>> {
    const { limit = CommentListLimit.Default, page = Pagination.FirstPage } =
      query;

    const where = { postId, ...NOT_DELETED };
    const [totalItems, records] = await this.prisma.$transaction([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        // id — второй ключ: у комментариев одной вставки совпадает createdAt.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - Pagination.FirstPage) * limit,
        take: limit,
      }),
    ]);

    return createPaginationResult({
      entities: records.map((record) => this.toDomain(record)),
      totalItems,
      currentPage: page,
      itemsPerPage: limit,
    });
  }

  public async findById(id: string): Promise<Comment | null> {
    const record = await this.prisma.comment.findFirst({
      where: { id, ...NOT_DELETED },
    });
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

  /**
   * Мягкое удаление: комментарий получает флаг isDeleted и дату удаления
   * deletedAt и пропадает из выборок.
   */
  public async softDeleteById(id: string): Promise<void> {
    await this.prisma.comment.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
