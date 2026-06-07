import { Injectable } from '@nestjs/common';
import { User } from '@project/shared-types';
import { UserRepository } from '../user/user.repository';
import { PasswordHasher } from './password.hasher';
import type { CreateUserDto } from './dto/create-user.dto';
import type { LoginUserDto } from './dto/login-user.dto';
import type { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import {
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from './authentication.errors';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async register(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(dto.email);
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      email: dto.email,
      name: dto.name,
      avatarUrl: dto.avatarUrl,
      passwordHash,
    });
  }

  public async verifyUser(dto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    return user;
  }

  public async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  public async changePassword(
    id: string,
    dto: ChangeUserPasswordDto,
  ): Promise<User> {
    const user = await this.getUser(id);

    const isPasswordValid = await this.passwordHasher.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    const updated = await this.userRepository.updatePasswordHash(
      id,
      passwordHash,
    );
    if (!updated) {
      throw new UserNotFoundError();
    }
    return updated;
  }
}
