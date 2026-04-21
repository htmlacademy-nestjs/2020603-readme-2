import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Like } from '@project/shared-types';

@Injectable()
export class LikeMemoryRepository {
  private readonly storage = new Map<string, Like>();

  public async findByPostAndUser(postId: string, userId: string): Promise<Like | null> {
    for (const like of this.storage.values()) {
      if (like.postId === postId && like.userId === userId) return like;
    }
    return null;
  }

  public async save(postId: string, userId: string): Promise<Like> {
    const like: Like = { id: randomUUID(), postId, userId, createdAt: new Date() };
    this.storage.set(like.id, like);
    return like;
  }

  public async deleteByPostAndUser(postId: string, userId: string): Promise<void> {
    for (const [id, like] of this.storage.entries()) {
      if (like.postId === postId && like.userId === userId) {
        this.storage.delete(id);
        return;
      }
    }
  }
}
