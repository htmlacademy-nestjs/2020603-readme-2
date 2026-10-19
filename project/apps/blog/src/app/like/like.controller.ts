import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { fillRdo } from '@project/shared-helpers';
import { LikeService } from './like.service.js';
import { LikeRdo } from './rdo/like.rdo';
import { CurrentUserId } from '../common/current-user-id.decorator';
import { RequireUserId } from '../common/require-user-id.decorator';

@ApiTags('likes')
@Controller('posts/:postId/likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @RequireUserId()
  @ApiOperation({ summary: 'Поставить лайк публикации' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Невалидный идентификатор публикации',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Лайк уже поставлен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Публикация не найдена',
  })
  public async add(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUserId() userId: string,
  ) {
    const like = await this.likeService.add(postId, userId);
    return fillRdo(LikeRdo, like);
  }

  @Delete()
  @RequireUserId()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Убрать лайк с публикации' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Невалидный идентификатор публикации',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Публикация не найдена или лайк не был поставлен',
  })
  public async remove(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUserId() userId: string,
  ) {
    await this.likeService.remove(postId, userId);
  }
}
