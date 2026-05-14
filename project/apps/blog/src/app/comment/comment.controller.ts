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
import { CommentService } from './comment.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { STUB_USER_ID} from '../app.constant';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии к публикации' })
  @ApiQuery({ name: 'page', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  public async index(@Param('postId') postId: string, @Query('page') page?: number) {
    return this.commentService.getComments(postId, page);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить комментарий к публикации' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async create(@Param('postId') postId: string, @Body() dto: CreateCommentDto) {
    return this.commentService.createComment(postId, dto, STUB_USER_ID);
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
