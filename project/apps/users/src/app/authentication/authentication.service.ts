import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, type TokenPayload } from '@project/shared-types';
import { UserService } from '../user/user.service';
import { jwtConfig } from '../config';
import { PasswordHasher } from './password.hasher';
import { NotifyClientService } from '../notify-client/notify-client.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { ChangeUserPasswordDto, LoginUserDto } from '@project/shared-dto';
import {
  InvalidCredentialsError,
  InvalidPasswordError,
  InvalidRefreshTokenError,
} from './authentication.errors';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoggedUser = AuthTokens & {
  id: string;
  email: string;
};

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly tokenConfig: ConfigType<typeof jwtConfig>,
    private readonly notifyClient: NotifyClientService,
  ) {}

  public async register(dto: CreateUserDto): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Уникальность email проверяет UserService.create.
    const user = await this.userService.create({
      email: dto.email,
      name: dto.name,
      avatarUrl: dto.avatarUrl,
      passwordHash,
    });

    // §7.2: новый пользователь сразу становится получателем рассылки.
    this.notifyClient.publishUserRegistered(user);

    return user;
  }

  /** §1.8: после проверки логина и пароля выдаётся пара JWT-токенов. */
  public async login(dto: LoginUserDto): Promise<LoggedUser> {
    const user = await this.verifyUser(dto);
    return this.createLoggedUser(user);
  }

  /** Обменивает refresh-токен на новую пару токенов. */
  public async refresh(refreshToken: string): Promise<LoggedUser> {
    const user = await this.verifyRefreshToken(refreshToken);
    return this.createLoggedUser(user);
  }

  public async verifyUser(dto: LoginUserDto): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }

  public async createTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.tokenConfig.accessTokenSecret,
        expiresIn: this.tokenConfig.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.tokenConfig.refreshTokenSecret,
        expiresIn: this.tokenConfig.refreshTokenExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /** Проверяет refresh-токен и возвращает его владельца. */
  public async verifyRefreshToken(refreshToken: string): Promise<User> {
    let payload: TokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.tokenConfig.refreshTokenSecret,
      });
    } catch {
      throw new InvalidRefreshTokenError();
    }

    return this.userService.getById(payload.sub);
  }

  public async changePassword(
    id: string,
    dto: ChangeUserPasswordDto,
  ): Promise<User> {
    const user = await this.userService.getById(id);

    const isPasswordValid = await this.passwordHasher.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    return this.userService.updatePasswordHash(id, passwordHash);
  }

  private async createLoggedUser(user: User): Promise<LoggedUser> {
    const tokens = await this.createTokens(user);
    return { id: user.id, email: user.email, ...tokens };
  }
}
