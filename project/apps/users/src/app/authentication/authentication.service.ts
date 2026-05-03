import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@project/shared-types';
import { UserEntity } from '../user/user.entity';
import { UserMemoryRepository } from '../user/user-memory.repository';
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
  ) {}

  public async register(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(AUTH_USER_EXISTS);
    }

    const userEntity = new UserEntity({
      id: '',
      email: dto.email,
      name: dto.name,
      passwordHash: '',
      avatarUrl: dto.avatarUrl,
      createdAt: new Date(),
    });

    await userEntity.setPassword(dto.password);
    return this.userRepository.save(userEntity.toObject());
  }

  public async verifyUser(dto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(AUTH_USER_NOT_FOUND);
    }

    const userEntity = new UserEntity(user);
    const isPasswordValid = await userEntity.comparePassword(dto.password);
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
    const userEntity = new UserEntity(user);

    const isPasswordValid = await userEntity.comparePassword(dto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_USER_PASSWORD_WRONG);
    }

    await userEntity.setPassword(dto.newPassword);
    return this.userRepository.update(userEntity.toObject());
  }
}
