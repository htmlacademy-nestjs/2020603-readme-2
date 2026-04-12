import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentMemoryRepository } from './comment-memory.repository';
import { CommentEntity } from './comment.entity';
import type { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentMemoryRepository) {}

  public async createComment(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentEntity> {
    const entity = new CommentEntity({
      id: '',
      postId,
      authorId,
      text: dto.text,
      createdAt: new Date(),
    });
    return this.commentRepository.save(entity);
  }

  public async getComments(postId: string, page?: number): Promise<CommentEntity[]> {
    return this.commentRepository.findByPostId(postId, page);
  }

  public async deleteComment(id: string, authorId: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== authorId) throw new ForbiddenException('Cannot delete another user\'s comment');
    await this.commentRepository.deleteById(id);
  }
}
