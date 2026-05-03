import type { Comment } from '@project/shared-types';

export interface CommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string, page?: number): Promise<Comment[]>;
  save(comment: Comment): Promise<Comment>;
  deleteById(id: string): Promise<void>;
  deleteByPostId(postId: string): Promise<void>;
}
