import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionParamDto } from './dto/subscription-param.dto';
import { SubscriptionWithUserRdo } from './rdo/subscription-with-user.rdo';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить подписки текущего пользователя (с карточками пользователей)' })
  @ApiOkResponse({
    description: 'Список подписок текущего пользователя',
    type: [SubscriptionWithUserRdo],
  })
  public async index() {
    return this.subscriptionsService.findSubscriptions();
  }

  @Post(':followingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Подписаться на пользователя' })
  @ApiParam({
    name: 'followingId',
    description: 'Идентификатор пользователя, на которого оформляется подписка',
  })
  @ApiCreatedResponse({ description: 'Подписка создана', type: SubscriptionWithUserRdo })
  @ApiBadRequestResponse({ description: 'Невалидный идентификатор пользователя' })
  @ApiConflictResponse({ description: 'Подписка уже существует или пользователь подписывается на себя' })
  public async subscribe(@Param() params: SubscriptionParamDto) {
    return this.subscriptionsService.subscribe(params);
  }

  @Delete(':followingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отписаться от пользователя' })
  @ApiParam({
    name: 'followingId',
    description: 'Идентификатор пользователя, от которого нужно отписаться',
  })
  @ApiNoContentResponse({ description: 'Подписка удалена' })
  @ApiBadRequestResponse({ description: 'Невалидный идентификатор пользователя' })
  @ApiNotFoundResponse({ description: 'Подписка не найдена' })
  public async unsubscribe(@Param() params: SubscriptionParamDto) {
    await this.subscriptionsService.unsubscribe(params);
  }
}
