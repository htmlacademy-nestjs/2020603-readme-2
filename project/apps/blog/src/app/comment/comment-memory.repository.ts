import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Comment } from '@project/shared-types';
import { DEFAULT_LIMIT } from './comment.constant.js';

@Injectable()
export class CommentMemoryRepository {
  private readonly storage = new Map<string, Comment>();

  public async findByPostId(postId: string, page = 1): Promise<Comment[]> {
    const all = [...this.storage.values()].filter((c) => c.postId === postId);
    const offset = (page - 1) * DEFAULT_LIMIT;
    return all.slice(offset, offset + DEFAULT_LIMIT);
  }

  public async findById(id: string): Promise<Comment | null> {
    return this.storage.get(id) ?? null;
  }

  public async save(comment: Comment): Promise<Comment> {
    comment.id = randomUUID();
    comment.createdAt = new Date();
    this.storage.set(comment.id, comment);
    return comment;
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }

  public async deleteByPostId(postId: string): Promise<void> {
    for (const [id, comment] of this.storage.entries()) {
      if (comment.postId === postId) this.storage.delete(id);
    }
  }
}
