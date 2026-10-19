import { Injectable } from '@nestjs/common';
import { Comment } from '@project/shared-types';
import type { PaginationResult } from '@project/shared-types';
import { CommentRepository } from './comment.repository';
import { PostService } from '../post/post.service';
import type { CreateCommentDto, GetCommentQueryDto } from '@project/shared-dto';
import {
  CommentDeleteForbiddenError,
  CommentNotFoundError,
} from './comment.errors';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
  ) {}

  public async create(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    // §6.5: комментируем только опубликованную публикацию. Заодно превращаем
    // отсутствие поста в 404 вместо ошибки внешнего ключа Prisma.
    await this.postService.getPublishedById(postId);

    const comment = new Comment();
    comment.id = '';
    comment.postId = postId;
    comment.authorId = authorId;
    comment.text = dto.text;
    comment.createdAt = new Date();

    return this.commentRepository.save(comment);
  }

  public async findByPostId(
    postId: string,
    query: GetCommentQueryDto,
  ): Promise<PaginationResult<Comment>> {
    await this.postService.getPublishedById(postId);
    return this.commentRepository.findByPostId(postId, query);
  }

  /**
   * §6.4: удалить можно только свой комментарий. Как и остальные операции
   * с комментариями, сначала проверяется публикация: у удалённой публикации
   * комментариев больше нет (§2.3).
   */
  public async remove(
    postId: string,
    id: string,
    authorId: string,
  ): Promise<void> {
    await this.postService.getPublishedById(postId);

    const comment = await this.commentRepository.findById(id);
    if (!comment || comment.postId !== postId) {
      throw new CommentNotFoundError(id);
    }
    if (comment.authorId !== authorId) {
      throw new CommentDeleteForbiddenError();
    }
    await this.commentRepository.softDeleteById(id);
  }
}
