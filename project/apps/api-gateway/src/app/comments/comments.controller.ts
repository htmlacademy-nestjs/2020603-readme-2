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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentQueryDto } from './dto/get-comment-query.dto';
import { PostIdParamDto } from './dto/post-id-param.dto';
import { CommentParamDto } from './dto/comment-param.dto';
import { CommentWithAuthorRdo } from './rdo/comment-with-author.rdo';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ApiPaginatedResponse } from '../common/api-paginated-response.decorator';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии к публикации (с обогащением авторов)' })
  @ApiParam({ name: 'postId', description: 'Идентификатор публикации', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiPaginatedResponse(CommentWithAuthorRdo, 'Постраничный список комментариев')
  public async index(
    @Param() params: PostIdParamDto,
    @Query() query: GetCommentQueryDto,
  ) {
    return this.commentsService.getComments(params.postId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить комментарий к публикации' })
  @ApiParam({ name: 'postId', description: 'Идентификатор публикации', format: 'uuid' })
  @ApiCreatedResponse({ description: 'Комментарий создан', type: CommentWithAuthorRdo })
  @ApiBadRequestResponse({ description: 'Невалидные данные комментария' })
  public async create(
    @Param() params: PostIdParamDto,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(params.postId, dto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({ name: 'postId', description: 'Идентификатор публикации', format: 'uuid' })
  @ApiParam({ name: 'commentId', description: 'Идентификатор комментария', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Комментарий удалён' })
  @ApiNotFoundResponse({ description: 'Комментарий не найден' })
  public async destroy(@Param() params: CommentParamDto) {
    await this.commentsService.deleteComment(params.postId, params.commentId);
  }
}
