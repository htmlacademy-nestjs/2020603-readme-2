import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { User } from '@project/shared-types';
import type { UserRepository } from './user.repository.interface.js';
import { UserEntity } from './user.entity.js';

@Injectable()
export class UserMemoryRepository implements UserRepository {
  private readonly storage = new Map<string, UserEntity>();

  public async findById(id: string): Promise<User | null> {
    const entity = this.storage.get(id);
    return entity ? entity.toObject() : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    for (const entity of this.storage.values()) {
      if (entity.email === email) {
        return entity.toObject();
      }
    }
    return null;
  }

  public async save(user: User): Promise<User> {
    const entity = new UserEntity(user);
    entity.id = randomUUID();
    entity.createdAt = new Date();
    this.storage.set(entity.id, entity);
    return entity.toObject();
  }

  public async update(user: User): Promise<User> {
    const entity = new UserEntity(user);
    this.storage.set(entity.id, entity);
    return entity.toObject();
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
