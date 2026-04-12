import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service.js';
import { STUB_USER_ID } from '../app.constant';

@ApiTags('likes')
@Controller('posts/:postId/likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @ApiOperation({ summary: 'Поставить лайк публикации' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Лайк уже поставлен' })
  public async addLike(@Param('postId') postId: string) {
    return this.likeService.addLike(postId, STUB_USER_ID);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Убрать лайк с публикации' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  public async removeLike(@Param('postId') postId: string) {
    await this.likeService.removeLike(postId, STUB_USER_ID);
  }
}
