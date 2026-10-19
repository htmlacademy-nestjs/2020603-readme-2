import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { fillRdo } from '@project/shared-helpers';
import { UserService } from './user.service';
import { UserIdParamDto } from '@project/shared-dto';
import { UserRdo } from './rdo/user.rdo';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о пользователе' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Информация о пользователе', type: UserRdo })
  @ApiBadRequestResponse({
    description: 'Невалидный идентификатор пользователя',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  public async show(@Param() params: UserIdParamDto): Promise<UserRdo> {
    const user = await this.userService.getById(params.id);
    return fillRdo(UserRdo, user);
  }
}
