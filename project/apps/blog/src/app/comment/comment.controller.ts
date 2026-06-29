import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { fillRdo, fillRdoPagination } from '@project/shared-helpers';
import { CommentService } from './comment.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { GetCommentQueryDto } from './dto/get-comment-query.dto';
import { CommentRdo } from './rdo/comment.rdo';
import { STUB_USER_ID } from '../app.constant';
import { ApiPaginatedResponse } from '../common/api-paginated-response.decorator';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии к публикации' })
  @ApiParam({ name: 'postId', description: 'Идентификатор публикации', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiPaginatedResponse(CommentRdo, 'Постраничный список комментариев')
  public async index(
    @Param('postId') postId: string,
    @Query() query: GetCommentQueryDto,
  ) {
    const comments = await this.commentService.getComments(postId, query);
    return fillRdoPagination(CommentRdo, comments);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить комментарий к публикации' })
  @ApiParam({ name: 'postId', description: 'Идентификатор публикации', format: 'uuid' })
  @ApiCreatedResponse({ description: 'Комментарий создан', type: CommentRdo })
  @ApiBadRequestResponse({ description: 'Невалидные данные комментария' })
  public async create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentService.createComment(
      postId,
      dto,
      STUB_USER_ID,
    );
    return fillRdo(CommentRdo, comment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({ name: 'postId', description: 'Идентификатор публикации', format: 'uuid' })
  @ApiParam({ name: 'id', description: 'Идентификатор комментария', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Комментарий удалён' })
  @ApiNotFoundResponse({ description: 'Комментарий не найден' })
  public async destroy(@Param('id') id: string) {
    await this.commentService.deleteComment(id, STUB_USER_ID);
  }
}
