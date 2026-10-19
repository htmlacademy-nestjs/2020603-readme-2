import { Injectable } from '@nestjs/common';
import type { PaginationResult } from '@project/shared-types';
import type { CreateCommentDto, GetCommentQueryDto } from '@project/shared-dto';
import { fillRdo, fillRdoList } from '@project/shared-helpers';
import { BlogClient } from '../clients/blog.client';
import { UsersClient } from '../clients/users.client';
import { CommentWithAuthorRdo } from './rdo/comment-with-author.rdo';

@Injectable()
export class CommentsService {
  constructor(
    private readonly blogClient: BlogClient,
    private readonly usersClient: UsersClient,
  ) {}

  public async findByPostId(
    postId: string,
    query: GetCommentQueryDto,
  ): Promise<PaginationResult<CommentWithAuthorRdo>> {
    const page = await this.blogClient.getComments(postId, query);
    const enrichedComments = await this.usersClient.attachAuthors(
      page.entities,
    );
    return {
      ...page,
      entities: fillRdoList(CommentWithAuthorRdo, enrichedComments),
    };
  }

  public async create(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<CommentWithAuthorRdo> {
    const comment = await this.blogClient.createComment(userId, postId, dto);
    const [enrichedComment] = await this.usersClient.attachAuthors([comment]);
    return fillRdo(CommentWithAuthorRdo, enrichedComment);
  }

  public async remove(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<void> {
    await this.blogClient.deleteComment(userId, postId, commentId);
  }
}
