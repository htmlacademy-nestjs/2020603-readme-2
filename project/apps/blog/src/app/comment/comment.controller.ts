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
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CommentService } from './comment.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentRdo } from './rdo/comment.rdo';
import { STUB_USER_ID } from '../app.constant';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии к публикации' })
  @ApiQuery({ name: 'page', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  public async index(
    @Param('postId') postId: string,
    @Query('page') page?: number,
  ) {
    const comments = await this.commentService.getComments(postId, page);
    return comments.map((comment) =>
      plainToInstance(CommentRdo, comment, { excludeExtraneousValues: true }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Добавить комментарий к публикации' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentService.createComment(
      postId,
      dto,
      STUB_USER_ID,
    );
    return plainToInstance(CommentRdo, comment, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  public async destroy(@Param('id') id: string) {
    await this.commentService.deleteComment(id, STUB_USER_ID);
  }
}
