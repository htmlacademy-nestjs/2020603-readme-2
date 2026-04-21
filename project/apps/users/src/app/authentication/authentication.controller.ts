import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { LoggedUserRdo} from './rdo/logged-user.rdo';
import { UserRdo} from '../user/rdo/user.rdo';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Пользователь успешно создан', type: UserRdo })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Пользователь с таким email уже существует' })
  public async register(@Body() dto: CreateUserDto): Promise<UserRdo> {
    const userEntity = await this.authenticationService.register(dto);
    const user = userEntity.toObject();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      postsCount: 0,
      subscribersCount: 0,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему (получение JWT токена)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Успешная авторизация', type: LoggedUserRdo })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Неверный пароль' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден' })
  public async login(@Body() dto: LoginUserDto): Promise<LoggedUserRdo> {
    const userEntity = await this.authenticationService.verifyUser(dto);
    // TODO: Заменить на реальную генерацию JWT через @nestjs/jwt
    return {
      id: userEntity.id,
      email: userEntity.email,
      accessToken: 'jwt-token-placeholder',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о пользователе' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Информация о пользователе', type: UserRdo })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден' })
  public async show(@Param('id') id: string): Promise<UserRdo> {
    const userEntity = await this.authenticationService.getUser(id);
    const user = userEntity.toObject();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      postsCount: 0,        // TODO: запрос к Blog Service через API Gateway
      subscribersCount: 0,  // TODO: подсчёт из таблицы подписок
    };
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Смена пароля пользователя' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пароль успешно изменён', type: UserRdo })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Текущий пароль неверен' })
  public async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangeUserPasswordDto,
  ): Promise<UserRdo> {
    const userEntity = await this.authenticationService.changePassword(id, dto);
    const user = userEntity.toObject();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      postsCount: 0,
      subscribersCount: 0,
    };
  }
}
