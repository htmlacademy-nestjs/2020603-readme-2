import { Injectable } from '@nestjs/common';
import { User } from '@project/shared-types';
import type { User as UserRecord } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: UserRecord): User {
    const user = new User();
    user.id = record.id;
    user.email = record.email;
    user.name = record.name;
    user.passwordHash = record.passwordHash;
    user.avatarUrl = record.avatarUrl ?? undefined;
    user.createdAt = record.createdAt;
    // Счётчики формируются здесь. Пока заглушки —
    // позже будут реальные агрегаты (подсчёт подписок/постов).
    user.postsCount = 0;
    user.subscribersCount = 0;
    return user;
  }

  public async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  public async create(data: CreateUserData): Promise<User> {
    const record = await this.prisma.user.create({ data });
    return this.toDomain(record);
  }

  public async updatePasswordHash(
    id: string,
    passwordHash: string,
  ): Promise<User | null> {
    const result = await this.prisma.user.updateMany({
      where: { id },
      data: { passwordHash },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(id);
  }

  public async deleteById(id: string): Promise<void> {
    await this.prisma.user.deleteMany({ where: { id } });
  }
}
