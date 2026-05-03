import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Comment } from '@project/shared-types';
import type { CommentRepository } from './comment.repository.interface.js';
import { CommentEntity } from './comment.entity.js';
import { DEFAULT_LIMIT } from './comment.constant.js';

@Injectable()
export class CommentMemoryRepository implements CommentRepository {
  private readonly storage = new Map<string, CommentEntity>();

  public async findByPostId(postId: string, page = 1): Promise<Comment[]> {
    const all = [...this.storage.values()].filter((c) => c.postId === postId);
    const offset = (page - 1) * DEFAULT_LIMIT;
    return all.slice(offset, offset + DEFAULT_LIMIT).map((entity) => entity.toObject());
  }

  public async findById(id: string): Promise<Comment | null> {
    const entity = this.storage.get(id);
    return entity ? entity.toObject() : null;
  }

  public async save(comment: Comment): Promise<Comment> {
    const entity = new CommentEntity(comment);
    entity.id = randomUUID();
    entity.createdAt = new Date();
    this.storage.set(entity.id, entity);
    return entity.toObject();
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
