import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UserDetailsRdo } from './rdo/user-details.rdo';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить профиль пользователя с агрегированными счётчиками' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Профиль пользователя', type: UserDetailsRdo })
  @ApiBadRequestResponse({ description: 'Невалидный идентификатор пользователя' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  public async show(@Param() params: UserIdParamDto): Promise<UserDetailsRdo> {
    return this.usersService.getUserDetails(params.id);
  }
}
