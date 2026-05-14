import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@project/shared-types';
import { UserMemoryRepository } from '../user/user-memory.repository';
import { PasswordHasher } from './password.hasher';
import type { CreateUserDto } from './dto/create-user.dto';
import type { LoginUserDto } from './dto/login-user.dto';
import type { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import {
  AUTH_USER_EXISTS,
  AUTH_USER_NOT_FOUND,
  AUTH_USER_PASSWORD_WRONG,
} from './authentication.constant';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserMemoryRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async register(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(AUTH_USER_EXISTS);
    }

    const user = new User();
    user.id = '';
    user.email = dto.email;
    user.name = dto.name;
    user.avatarUrl = dto.avatarUrl;
    user.createdAt = new Date();
    user.passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.save(user);
  }

  public async verifyUser(dto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(AUTH_USER_NOT_FOUND);
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_USER_PASSWORD_WRONG);
    }

    return user;
  }

  public async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(AUTH_USER_NOT_FOUND);
    }
    return user;
  }

  public async changePassword(id: string, dto: ChangeUserPasswordDto): Promise<User> {
    const user = await this.getUser(id);

    const isPasswordValid = await this.passwordHasher.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_USER_PASSWORD_WRONG);
    }

    user.passwordHash = await this.passwordHasher.hash(dto.newPassword);
    return this.userRepository.update(user);
  }
}
