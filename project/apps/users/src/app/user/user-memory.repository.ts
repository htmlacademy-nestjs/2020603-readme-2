import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { UserRepository } from './user.repository.interface.js';
import { UserEntity } from './user.entity.js';

@Injectable()
export class UserMemoryRepository implements UserRepository {
  private readonly storage = new Map<string, UserEntity>();

  public async findById(id: string): Promise<UserEntity | null> {
    return this.storage.get(id) ?? null;
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    for (const entity of this.storage.values()) {
      if (entity.email === email) {
        return entity;
      }
    }
    return null;
  }

  public async save(entity: UserEntity): Promise<UserEntity> {
    entity.id = randomUUID();
    entity.createdAt = new Date();
    this.storage.set(entity.id, entity);
    return entity;
  }

  public async update(entity: UserEntity): Promise<UserEntity> {
    this.storage.set(entity.id, entity);
    return entity;
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
