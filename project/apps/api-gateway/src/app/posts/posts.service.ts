import { Injectable } from '@nestjs/common';
import { PostType } from '@project/shared-types';
import type { PaginationResult } from '@project/shared-types';
import type {
  GetPostQueryDto,
  LinkPostContentDto,
  QuotePostContentDto,
  TextPostContentDto,
  UpdatePostDto,
  VideoPostContentDto,
} from '@project/shared-dto';
import { fillRdo, fillRdoList } from '@project/shared-helpers';
import { BlogClient, type BlogPost } from '../clients/blog.client';
import { UsersClient } from '../clients/users.client';
import { FileStorageClient } from '../clients/file-storage.client';
import type { CreatePhotoPostDto } from './dto/create-photo-post.dto';
import { PostWithAuthorRdo } from './rdo/post-with-author.rdo';

type PostContentDto =
  | VideoPostContentDto
  | TextPostContentDto
  | QuotePostContentDto
  | LinkPostContentDto;

@Injectable()
export class PostsService {
  constructor(
    private readonly blogClient: BlogClient,
    private readonly usersClient: UsersClient,
    private readonly fileStorageClient: FileStorageClient,
  ) {}

  public async findAll(
    query: GetPostQueryDto,
  ): Promise<PaginationResult<PostWithAuthorRdo>> {
    const page = await this.blogClient.getPosts(query);
    return this.enrichPage(page);
  }

  public async findFeed(
    userId: string,
    query: GetPostQueryDto,
  ): Promise<PaginationResult<PostWithAuthorRdo>> {
    const page = await this.blogClient.getFeed(userId, query);
    return this.enrichPage(page);
  }

  public async findDrafts(
    userId: string,
    query: GetPostQueryDto,
  ): Promise<PaginationResult<PostWithAuthorRdo>> {
    const page = await this.blogClient.getDrafts(userId, query);
    return this.enrichPage(page);
  }

  public async search(title: string): Promise<PostWithAuthorRdo[]> {
    const posts = await this.blogClient.searchPosts(title);
    return this.enrichList(posts);
  }

  public async findOne(
    id: string,
    userId?: string,
  ): Promise<PostWithAuthorRdo> {
    const post = await this.blogClient.getPost(id, userId);
    return this.enrichOne(post);
  }

  /** Видео, текст, цитата и ссылка: тип задаёт маршрут, автор берётся из токена. */
  public async create(
    userId: string,
    type: PostType,
    dto: PostContentDto,
  ): Promise<PostWithAuthorRdo> {
    const post = await this.blogClient.createPost(userId, type, {
      ...dto,
      type,
    });
    return this.enrichOne(post);
  }

  /** §2.8: фото сначала загружается в file-storage, в blog уходит его URL. */
  public async createPhoto(
    userId: string,
    dto: CreatePhotoPostDto,
    file: Express.Multer.File,
  ): Promise<PostWithAuthorRdo> {
    const stored = await this.fileStorageClient.uploadPhoto(file);
    const post = await this.blogClient.createPost(userId, PostType.Photo, {
      type: PostType.Photo,
      photoUrl: stored.url,
      tags: dto.tags,
    });
    return this.enrichOne(post);
  }

  public async update(
    userId: string,
    id: string,
    dto: UpdatePostDto,
  ): Promise<PostWithAuthorRdo> {
    const post = await this.blogClient.updatePost(userId, id, { ...dto });
    return this.enrichOne(post);
  }

  public async remove(userId: string, id: string): Promise<void> {
    await this.blogClient.deletePost(userId, id);
  }

  public async repost(userId: string, id: string): Promise<PostWithAuthorRdo> {
    const post = await this.blogClient.repost(userId, id);
    return this.enrichOne(post);
  }

  private async enrichOne(post: BlogPost): Promise<PostWithAuthorRdo> {
    const [enrichedPost] = await this.usersClient.attachAuthors([post]);
    return fillRdo(PostWithAuthorRdo, enrichedPost);
  }

  private async enrichList(posts: BlogPost[]): Promise<PostWithAuthorRdo[]> {
    const enrichedPosts = await this.usersClient.attachAuthors(posts);
    return fillRdoList(PostWithAuthorRdo, enrichedPosts);
  }

  private async enrichPage(
    page: PaginationResult<BlogPost>,
  ): Promise<PaginationResult<PostWithAuthorRdo>> {
    return { ...page, entities: await this.enrichList(page.entities) };
  }
}
