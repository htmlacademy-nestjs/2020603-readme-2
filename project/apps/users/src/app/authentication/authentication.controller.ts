import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { fillRdo } from '@project/shared-helpers';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ChangeUserPasswordDto,
  LoginUserDto,
  RefreshTokenDto,
  UserIdParamDto,
} from '@project/shared-dto';
import { LoggedUserRdo } from './rdo/logged-user.rdo';
import { UserRdo } from '../user/rdo/user.rdo';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiCreatedResponse({
    description: 'Пользователь успешно создан',
    type: UserRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидные данные регистрации' })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
  })
  public async register(@Body() dto: CreateUserDto): Promise<UserRdo> {
    const user = await this.authenticationService.register(dto);
    return fillRdo(UserRdo, user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему (получение JWT токенов)' })
  @ApiOkResponse({ description: 'Успешная авторизация', type: LoggedUserRdo })
  @ApiBadRequestResponse({ description: 'Невалидные данные авторизации' })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  public async login(@Body() dto: LoginUserDto): Promise<LoggedUserRdo> {
    const loggedUser = await this.authenticationService.login(dto);
    return fillRdo(LoggedUserRdo, loggedUser);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обменять refresh-токен на новую пару токенов' })
  @ApiOkResponse({ description: 'Новая пара токенов', type: LoggedUserRdo })
  @ApiBadRequestResponse({ description: 'Невалидный формат токена' })
  @ApiUnauthorizedResponse({
    description: 'Refresh-токен недействителен или истёк',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  public async refresh(@Body() dto: RefreshTokenDto): Promise<LoggedUserRdo> {
    const loggedUser = await this.authenticationService.refresh(
      dto.refreshToken,
    );
    return fillRdo(LoggedUserRdo, loggedUser);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Смена пароля пользователя' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Пароль успешно изменён', type: UserRdo })
  @ApiBadRequestResponse({ description: 'Невалидные данные смены пароля' })
  @ApiUnauthorizedResponse({ description: 'Текущий пароль неверен' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  public async changePassword(
    @Param() params: UserIdParamDto,
    @Body() dto: ChangeUserPasswordDto,
  ): Promise<UserRdo> {
    const user = await this.authenticationService.changePassword(
      params.id,
      dto,
    );
    return fillRdo(UserRdo, user);
  }
}
