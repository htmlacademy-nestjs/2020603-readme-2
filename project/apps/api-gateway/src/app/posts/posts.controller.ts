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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MaxFileSize, PostType } from '@project/shared-types';
import {
  GetPostQueryDto,
  LinkPostContentDto,
  QuotePostContentDto,
  SearchPostQueryDto,
  TextPostContentDto,
  UpdatePostDto,
  VideoPostContentDto,
} from '@project/shared-dto';
import {
  ApiPaginatedResponse,
  createImageFilePipe,
} from '@project/shared-helpers';
import { PostsService } from './posts.service';
import { CreatePhotoPostDto } from './dto/create-photo-post.dto';
import { PostIdParamDto } from './dto/post-id-param.dto';
import { PostWithAuthorRdo } from './rdo/post-with-author.rdo';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { OptionalJwtAuthGuard } from '../common/optional-jwt-auth.guard';

const PHOTO_POST_BODY_SCHEMA = {
  schema: {
    type: 'object',
    required: ['photo'],
    properties: {
      photo: { type: 'string', format: 'binary' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        example: ['photo', 'nature'],
      },
    },
  },
};

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список публикаций (с обогащением авторов)',
  })
  @ApiPaginatedResponse(PostWithAuthorRdo, 'Список опубликованных публикаций')
  public async index(@Query() query: GetPostQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить ленту текущего пользователя' })
  @ApiPaginatedResponse(
    PostWithAuthorRdo,
    'Постраничная лента текущего пользователя',
  )
  public async getFeed(
    @CurrentUser('sub') userId: string,
    @Query() query: GetPostQueryDto,
  ) {
    return this.postsService.findFeed(userId, query);
  }

  @Get('drafts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить черновики текущего пользователя' })
  @ApiPaginatedResponse(
    PostWithAuthorRdo,
    'Постраничный список черновиков текущего пользователя',
  )
  public async getDrafts(
    @CurrentUser('sub') userId: string,
    @Query() query: GetPostQueryDto,
  ) {
    return this.postsService.findDrafts(userId, query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск публикаций по заголовку' })
  @ApiQuery({ name: 'title', description: 'Строка для поиска' })
  @ApiOkResponse({
    description: 'Результаты поиска',
    type: [PostWithAuthorRdo],
  })
  @ApiBadRequestResponse({ description: 'Невалидные параметры поиска' })
  public async search(@Query() query: SearchPostQueryDto) {
    return this.postsService.search(query.title);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Получить публикацию по ID (с обогащением автора). Токен необязателен: с ним автор видит и свой черновик',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Публикация найдена', type: PostWithAuthorRdo })
  @ApiBadRequestResponse({ description: 'Невалидный идентификатор публикации' })
  @ApiNotFoundResponse({ description: 'Публикация не найдена' })
  public async show(
    @Param() params: PostIdParamDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.postsService.findOne(params.id, userId);
  }

  @Post('video')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать публикацию типа «Видео»' })
  @ApiCreatedResponse({
    description: 'Публикация создана',
    type: PostWithAuthorRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидные данные публикации' })
  public async createVideo(
    @CurrentUser('sub') userId: string,
    @Body() dto: VideoPostContentDto,
  ) {
    return this.postsService.create(userId, PostType.Video, dto);
  }

  @Post('text')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать публикацию типа «Текст»' })
  @ApiCreatedResponse({
    description: 'Публикация создана',
    type: PostWithAuthorRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидные данные публикации' })
  public async createText(
    @CurrentUser('sub') userId: string,
    @Body() dto: TextPostContentDto,
  ) {
    return this.postsService.create(userId, PostType.Text, dto);
  }

  @Post('quote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать публикацию типа «Цитата»' })
  @ApiCreatedResponse({
    description: 'Публикация создана',
    type: PostWithAuthorRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидные данные публикации' })
  public async createQuote(
    @CurrentUser('sub') userId: string,
    @Body() dto: QuotePostContentDto,
  ) {
    return this.postsService.create(userId, PostType.Quote, dto);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Создать публикацию типа «Фото» (multipart)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(PHOTO_POST_BODY_SCHEMA)
  @ApiCreatedResponse({
    description: 'Публикация создана',
    type: PostWithAuthorRdo,
  })
  @ApiBadRequestResponse({
    description: 'Невалидный файл или данные публикации',
  })
  public async createPhoto(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePhotoPostDto,
    @UploadedFile(createImageFilePipe({ maxSize: MaxFileSize.Photo }))
    file: Express.Multer.File,
  ) {
    return this.postsService.createPhoto(userId, dto, file);
  }

  @Post('link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать публикацию типа «Ссылка»' })
  @ApiCreatedResponse({
    description: 'Публикация создана',
    type: PostWithAuthorRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидные данные публикации' })
  public async createLink(
    @CurrentUser('sub') userId: string,
    @Body() dto: LinkPostContentDto,
  ) {
    return this.postsService.create(userId, PostType.Link, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить публикацию' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Публикация обновлена',
    type: PostWithAuthorRdo,
  })
  @ApiBadRequestResponse({ description: 'Невалидные данные публикации' })
  @ApiForbiddenResponse({
    description: 'Редактировать можно только свои публикации',
  })
  @ApiNotFoundResponse({ description: 'Публикация не найдена' })
  public async update(
    @Param() params: PostIdParamDto,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(userId, params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить публикацию' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiNoContentResponse({ description: 'Публикация удалена' })
  @ApiForbiddenResponse({ description: 'Удалять можно только свои публикации' })
  @ApiNotFoundResponse({ description: 'Публикация не найдена' })
  public async destroy(
    @Param() params: PostIdParamDto,
    @CurrentUser('sub') userId: string,
  ) {
    await this.postsService.remove(userId, params.id);
  }

  @Post(':id/repost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Репостнуть публикацию' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор публикации',
    format: 'uuid',
  })
  @ApiCreatedResponse({ description: 'Репост создан', type: PostWithAuthorRdo })
  @ApiNotFoundResponse({ description: 'Публикация не найдена' })
  @ApiConflictResponse({
    description: 'Репост уже был сделан ранее или это своя публикация',
  })
  public async repost(
    @Param() params: PostIdParamDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.postsService.repost(userId, params.id);
  }
}
