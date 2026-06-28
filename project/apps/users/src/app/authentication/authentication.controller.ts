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
import { plainToInstance } from 'class-transformer';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';
import { LoggedUserRdo } from './rdo/logged-user.rdo';
import { UserIdParamDto } from '../user/dto/user-id-param.dto';
import { UserRdo } from '../user/rdo/user.rdo';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Пользователь успешно создан', type: UserRdo })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Невалидные данные регистрации' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Пользователь с таким email уже существует' })
  public async register(@Body() dto: CreateUserDto): Promise<UserRdo> {
    const user = await this.authenticationService.register(dto);
    return plainToInstance(UserRdo, user, { excludeExtraneousValues: true });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему (получение JWT токена)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Успешная авторизация', type: LoggedUserRdo })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Неверный пароль' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден' })
  public async login(@Body() dto: LoginUserDto): Promise<LoggedUserRdo> {
    const user = await this.authenticationService.verifyUser(dto);
    // TODO: Заменить на реальную генерацию JWT через @nestjs/jwt
    return {
      id: user.id,
      email: user.email,
      accessToken: 'jwt-token-placeholder',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о пользователе' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя', example: '6707cf8c1234567890abcdef' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Информация о пользователе', type: UserRdo })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден' })
  public async show(@Param() params: UserIdParamDto): Promise<UserRdo> {
    const user = await this.authenticationService.getUser(params.id);
    return plainToInstance(UserRdo, user, { excludeExtraneousValues: true });
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Смена пароля пользователя' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя', example: '6707cf8c1234567890abcdef' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Пароль успешно изменён', type: UserRdo })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Текущий пароль неверен' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден' })
  public async changePassword(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserPasswordDto,
  ): Promise<UserRdo> {
    const user = await this.authenticationService.changePassword(params.id, dto);
    return plainToInstance(UserRdo, user, { excludeExtraneousValues: true });
  }
}
