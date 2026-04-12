import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommentEntity } from './comment.entity';
import { DEFAULT_LIMIT } from './comment.constant';

@Injectable()
export class CommentMemoryRepository {
  private readonly storage = new Map<string, CommentEntity>();

  public async findByPostId(postId: string, page = 1): Promise<CommentEntity[]> {
    const all = [...this.storage.values()].filter((c) => c.postId === postId);
    const offset = (page - 1) * DEFAULT_LIMIT;
    return all.slice(offset, offset + DEFAULT_LIMIT);
  }

  public async findById(id: string): Promise<CommentEntity | null> {
    return this.storage.get(id) ?? null;
  }

  public async save(entity: CommentEntity): Promise<CommentEntity> {
    entity.id = randomUUID();
    entity.createdAt = new Date();
    this.storage.set(entity.id, entity);
    return entity;
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
