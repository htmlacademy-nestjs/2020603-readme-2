import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@project/shared-types';
import { UserModel, UserDocument } from './user.schema';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl?: string;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private documentToUser(document: UserDocument): User {
    const user = new User();
    user.id = document._id.toString();
    user.email = document.email;
    user.name = document.name;
    user.passwordHash = document.passwordHash;
    user.avatarUrl = document.avatarUrl;
    user.createdAt = document.createdAt;
    // Счётчики формируются здесь. Пока заглушки —
    // позже будут реальные агрегаты (подсчёт подписок/постов).
    user.postsCount = 0;
    user.subscribersCount = 0;
    return user;
  }

  public async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).exec();
    return document ? this.documentToUser(document) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({ email }).exec();
    return document ? this.documentToUser(document) : null;
  }

  public async create(data: CreateUserData): Promise<User> {
    const document = await new this.userModel(data).save();
    return this.documentToUser(document);
  }

  public async updatePasswordHash(
    id: string,
    passwordHash: string,
  ): Promise<User | null> {
    const document = await this.userModel
      .findByIdAndUpdate(id, { passwordHash }, { new: true })
      .exec();
    return document ? this.documentToUser(document) : null;
  }

  public async deleteById(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
