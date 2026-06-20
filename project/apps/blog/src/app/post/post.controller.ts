import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { Post as DomainPost } from '@project/shared-types';
import { PostService } from './post.service.js';
import { CreateVideoPostDto } from './dto/create-video-post.dto';
import { CreateTextPostDto } from './dto/create-text-post.dto';
import { CreateQuotePostDto } from './dto/create-quote-post.dto';
import { CreatePhotoPostDto } from './dto/create-photo-post.dto';
import { CreateLinkPostDto } from './dto/create-link-post.dto';
import { GetPostQueryDto } from './dto/get-post-query.dto';
import { PostRdo } from './rdo/post.rdo';
import { STUB_USER_ID } from '../app.constant';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  private toRdo(post: DomainPost): PostRdo {
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  private toRdoList(posts: DomainPost[]): PostRdo[] {
    return posts.map((post) => this.toRdo(post));
  }

  @Get()
  @ApiOperation({ summary: 'Получить список публикаций' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список публикаций' })
  public async index(@Query() query: GetPostQueryDto) {
    return this.toRdoList(await this.postService.findAll(query));
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Получить черновики текущего пользователя' })
  @ApiResponse({ status: HttpStatus.OK })
  public async drafts() {
    return this.toRdoList(await this.postService.findDrafts(STUB_USER_ID));
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск публикаций по заголовку' })
  @ApiQuery({ name: 'title', description: 'Строка для поиска' })
  @ApiResponse({ status: HttpStatus.OK })
  public async search(@Query('title') title: string) {
    return this.toRdoList(await this.postService.search(title));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить публикацию по ID' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  public async show(@Param('id') id: string) {
    return this.toRdo(await this.postService.findPost(id));
  }

  @Post('video')
  @ApiOperation({ summary: 'Создать публикацию типа «Видео»' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async createVideo(@Body() dto: CreateVideoPostDto) {
    return this.toRdo(await this.postService.createPost(dto, STUB_USER_ID));
  }

  @Post('text')
  @ApiOperation({ summary: 'Создать публикацию типа «Текст»' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async createText(@Body() dto: CreateTextPostDto) {
    return this.toRdo(await this.postService.createPost(dto, STUB_USER_ID));
  }

  @Post('quote')
  @ApiOperation({ summary: 'Создать публикацию типа «Цитата»' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async createQuote(@Body() dto: CreateQuotePostDto) {
    return this.toRdo(await this.postService.createPost(dto, STUB_USER_ID));
  }

  @Post('photo')
  @ApiOperation({ summary: 'Создать публикацию типа «Фото»' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async createPhoto(@Body() dto: CreatePhotoPostDto) {
    return this.toRdo(await this.postService.createPost(dto, STUB_USER_ID));
  }

  @Post('link')
  @ApiOperation({ summary: 'Создать публикацию типа «Ссылка»' })
  @ApiResponse({ status: HttpStatus.CREATED })
  public async createLink(@Body() dto: CreateLinkPostDto) {
    return this.toRdo(await this.postService.createPost(dto, STUB_USER_ID));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить публикацию' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  public async update(@Param('id') id: string, @Body() dto: any) {
    return this.toRdo(await this.postService.updatePost(id, dto, STUB_USER_ID));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить публикацию' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  public async destroy(@Param('id') id: string) {
    await this.postService.deletePost(id, STUB_USER_ID);
  }

  @Post(':id/repost')
  @ApiOperation({ summary: 'Репостнуть публикацию' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Публикация не найдена' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Репост уже был сделан ранее' })
  public async repost(@Param('id') id: string) {
    return this.toRdo(await this.postService.repost(id, STUB_USER_ID));
  }
}
