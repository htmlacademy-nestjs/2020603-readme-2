import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { User } from '@project/shared-types';

@Injectable()
export class UserMemoryRepository {
  private readonly storage = new Map<string, User>();

  public async findById(id: string): Promise<User | null> {
    return this.storage.get(id) ?? null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    for (const user of this.storage.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  public async save(user: User): Promise<User> {
    user.id = randomUUID();
    user.createdAt = new Date();
    this.storage.set(user.id, user);
    return user;
  }

  public async update(user: User): Promise<User> {
    this.storage.set(user.id, user);
    return user;
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
