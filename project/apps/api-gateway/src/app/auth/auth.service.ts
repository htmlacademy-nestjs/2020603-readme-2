import { Injectable } from '@nestjs/common';
import { fillRdo } from '@project/shared-helpers';
import { UsersClient } from '../clients/users.client';
import { FileStorageClient } from '../clients/file-storage.client';
import {
  ChangeUserPasswordDto,
  LoginUserDto,
  RefreshTokenDto,
  RegisterUserDto,
} from '@project/shared-dto';
import { UserRdo } from './rdo/user.rdo';
import { LoggedUserRdo } from './rdo/logged-user.rdo';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersClient: UsersClient,
    private readonly fileStorageClient: FileStorageClient,
  ) {}

  public async register(
    dto: RegisterUserDto,
    file?: Express.Multer.File,
  ): Promise<UserRdo> {
    // §1.2: аватар необязателен; загруженный файл превращается в его URL.
    const avatarUrl = file
      ? (await this.fileStorageClient.uploadAvatar(file)).url
      : undefined;

    const user = await this.usersClient.register({
      email: dto.email,
      name: dto.name,
      password: dto.password,
      avatarUrl,
    });

    return fillRdo(UserRdo, user);
  }

  public async login(dto: LoginUserDto): Promise<LoggedUserRdo> {
    const result = await this.usersClient.login(dto);
    return fillRdo(LoggedUserRdo, result);
  }

  public async refresh(dto: RefreshTokenDto): Promise<LoggedUserRdo> {
    const result = await this.usersClient.refresh(dto);
    return fillRdo(LoggedUserRdo, result);
  }

  public async changePassword(
    userId: string,
    dto: ChangeUserPasswordDto,
  ): Promise<UserRdo> {
    const user = await this.usersClient.changePassword(userId, dto);
    return fillRdo(UserRdo, user);
  }
}
