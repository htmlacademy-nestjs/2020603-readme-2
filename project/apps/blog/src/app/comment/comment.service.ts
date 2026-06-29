import { Injectable } from '@nestjs/common';
import { Comment } from '@project/shared-types';
import type { PaginationResult } from '@project/shared-types';
import { CommentRepository } from './comment.repository';
import type { CreateCommentDto } from './dto/create-comment.dto';
import type { GetCommentQueryDto } from './dto/get-comment-query.dto';
import { CommentNotFoundError } from './comment.errors';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  public async createComment(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    const comment = new Comment();
    comment.id = '';
    comment.postId = postId;
    comment.authorId = authorId;
    comment.text = dto.text;
    comment.createdAt = new Date();

    return this.commentRepository.save(comment);
  }

  public async getComments(
    postId: string,
    query: GetCommentQueryDto,
  ): Promise<PaginationResult<Comment>> {
    return this.commentRepository.findByPostId(postId, query);
  }

  public async deleteComment(id: string, authorId: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new CommentNotFoundError(id);
    if (comment.authorId !== authorId) throw new CommentNotFoundError(id);
    await this.commentRepository.deleteById(id);
  }
}
