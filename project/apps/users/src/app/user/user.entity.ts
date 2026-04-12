import { compare, genSalt, hash } from 'bcrypt';
import type { User } from '@project/shared-types';
import { SALT_ROUNDS } from './user.constant.js';

export class UserEntity implements User {
  public id: string;
  public email: string;
  public name: string;
  public passwordHash: string;
  public avatarUrl?: string;
  public createdAt: Date;

  constructor(data: User) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.passwordHash = data.passwordHash;
    this.avatarUrl = data.avatarUrl;
    this.createdAt = data.createdAt;
  }

  public toObject(): User {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      passwordHash: this.passwordHash,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
    };
  }

  public async setPassword(password: string): Promise<UserEntity> {
    const salt = await genSalt(SALT_ROUNDS);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.passwordHash);
  }
}
