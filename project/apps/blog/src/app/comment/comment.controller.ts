import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiPaginatedResponse,
  fillRdo,
  fillRdoPagination,
} from '@project/shared-helpers';
import { CommentService } from './comment.service.js';
import { CreateCommentDto, GetCommentQueryDto } from '@project/shared-dto';
import { CommentRdo } from './rdo/comment.rdo';
import { CurrentUserId } from '../common/current-user-id.decorator';
import { RequireUserId } from '../common/require-user-id.decorator';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии к публикации' })
  @ApiParam({
    name: 'postId',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiPaginatedResponse(CommentRdo, 'Постраничный список комментариев')
  @ApiBadRequestResponse({ description: 'Невалидные параметры запроса' })
  @ApiNotFoundResponse({ description: 'Публикация не найдена' })
  public async index(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: GetCommentQueryDto,
  ) {
    const comments = await this.commentService.findByPostId(postId, query);
    return fillRdoPagination(CommentRdo, comments);
  }

  @Post()
  @RequireUserId()
  @ApiOperation({ summary: 'Добавить комментарий к публикации' })
  @ApiParam({
    name: 'postId',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiCreatedResponse({ description: 'Комментарий создан', type: CommentRdo })
  @ApiBadRequestResponse({ description: 'Невалидные данные комментария' })
  @ApiNotFoundResponse({ description: 'Публикация не найдена' })
  public async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUserId() userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentService.create(postId, dto, userId);
    return fillRdo(CommentRdo, comment);
  }

  @Delete(':id')
  @RequireUserId()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({
    name: 'postId',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор комментария',
    format: 'uuid',
  })
  @ApiNoContentResponse({ description: 'Комментарий удалён' })
  @ApiBadRequestResponse({
    description: 'Невалидный идентификатор комментария',
  })
  @ApiForbiddenResponse({
    description: 'Удалять можно только свои комментарии',
  })
  @ApiNotFoundResponse({ description: 'Комментарий не найден' })
  public async destroy(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ) {
    await this.commentService.remove(postId, id, userId);
  }
}
