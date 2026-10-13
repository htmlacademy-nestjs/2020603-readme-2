import { Injectable } from '@nestjs/common';
import {
  LinkPost,
  PhotoPost,
  PostStatus,
  PostType,
  QuotePost,
  TextPost,
  VideoPost,
} from '@project/shared-types';
import type { PaginationResult, Post } from '@project/shared-types';
import { normalizeTags } from '@project/shared-helpers';
import { PostRepository } from './post.repository';
import { NotifyClientService } from '../notify-client/notify-client.service';
import { SubscriptionService } from '../subscription/subscription.service';
import type { GetPostQueryDto, UpdatePostDto } from '@project/shared-dto';
import type { CreateVideoPostDto } from './dto/create-video-post.dto';
import type { CreateTextPostDto } from './dto/create-text-post.dto';
import type { CreateQuotePostDto } from './dto/create-quote-post.dto';
import type { CreatePhotoPostDto } from './dto/create-photo-post.dto';
import type { CreateLinkPostDto } from './dto/create-link-post.dto';
import {
  PostNotFoundError,
  PostEditForbiddenError,
  PostAlreadyRepostedError,
  SelfRepostError,
} from './post.errors';

type CreatePostDto =
  | CreateVideoPostDto
  | CreateTextPostDto
  | CreateQuotePostDto
  | CreatePhotoPostDto
  | CreateLinkPostDto;

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly notifyClient: NotifyClientService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  public async create(dto: CreatePostDto, authorId: string): Promise<Post> {
    const post = this.buildFromDto(dto);
    this.assignNewRecordFields(post, authorId);
    post.status = PostStatus.Published;
    post.isRepost = false;
    post.tags = normalizeTags(dto.tags ?? []);

    const saved = await this.postRepository.save(post);
    this.notifyClient.publishPostPublished(saved);
    return saved;
  }

  /**
   * Детальная информация о публикации (§2.14). Черновик виден только автору:
   * для остальных он «не найден», чтобы не раскрывать его существование (§3.5).
   */
  public async getById(id: string, requesterId?: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new PostNotFoundError(id);
    }

    if (post.status !== PostStatus.Published && post.authorId !== requesterId) {
      throw new PostNotFoundError(id);
    }

    return post;
  }

  /**
   * Публикация в статусе «Опубликована»: лайки (§5.2), комментарии (§6.5) и
   * репост (§2.13) применимы только к ней.
   */
  public async getPublishedById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post || post.status !== PostStatus.Published) {
      throw new PostNotFoundError(id);
    }
    return post;
  }

  public async findAll(
    query: GetPostQueryDto,
  ): Promise<PaginationResult<Post>> {
    return this.postRepository.findAll(query);
  }

  /**
   * Лента (§4.2, §4.3): публикации авторов, на которых подписан пользователь,
   * плюс его собственные. Подписки берём через сервис их модуля, а не из
   * чужой таблицы.
   */
  public async findFeed(
    userId: string,
    query: GetPostQueryDto,
  ): Promise<PaginationResult<Post>> {
    const followingIds =
      await this.subscriptionService.findFollowingIds(userId);
    const authorIds = [...new Set([userId, ...followingIds])];
    return this.postRepository.findPublishedByAuthors(authorIds, query);
  }

  public async findDrafts(
    authorId: string,
    query: GetPostQueryDto,
  ): Promise<PaginationResult<Post>> {
    return this.postRepository.findDrafts(authorId, query);
  }

  public async search(title: string): Promise<Post[]> {
    return this.postRepository.findByTitle(title);
  }

  public async update(
    id: string,
    dto: UpdatePostDto,
    authorId: string,
  ): Promise<Post> {
    const post = await this.getOwned(id, authorId);
    const wasPublished = post.status === PostStatus.Published;

    // Берём только переданные поля: у скомпилированного DTO необъявленные
    // свойства существуют со значением `undefined` и затёрли бы данные поста.
    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );

    Object.assign(post, patch, {
      tags: dto.tags ? normalizeTags(dto.tags) : post.tags,
    });

    const updated = await this.postRepository.update(post);
    this.notifyStatusChange(updated, wasPublished);
    return updated;
  }

  public async remove(id: string, authorId: string): Promise<void> {
    const post = await this.getOwned(id, authorId);
    await this.postRepository.softDeleteById(id);

    // Черновик уже снят с рассылки при переходе в этот статус.
    if (post.status === PostStatus.Published) {
      this.notifyClient.publishPostUnpublished(id);
    }
  }

  public async repost(id: string, authorId: string): Promise<Post> {
    const original = await this.getPublishedById(id);

    if (original.authorId === authorId) {
      throw new SelfRepostError();
    }

    const existingRepost = await this.postRepository.findRepost(id, authorId);
    if (existingRepost) {
      throw new PostAlreadyRepostedError(id);
    }

    const reposted = this.cloneByType(original);
    this.assignNewRecordFields(reposted, authorId);
    reposted.originalAuthorId = original.authorId;
    reposted.originalPostId = original.id;
    reposted.isRepost = true;

    const saved = await this.postRepository.save(reposted);
    this.notifyClient.publishPostPublished(saved);
    return saved;
  }

  /** Публикация, которую редактирует или удаляет её автор (§2.2). */
  private async getOwned(id: string, authorId: string): Promise<Post> {
    const post = await this.getById(id, authorId);
    if (post.authorId !== authorId) {
      throw new PostEditForbiddenError();
    }
    return post;
  }

  /**
   * Поля новой записи: идентификатор и счётчики выдаёт база, автор — текущий
   * пользователь, дата публикации при первом сохранении равна дате создания (§2.11).
   */
  private assignNewRecordFields(post: Post, authorId: string): void {
    const now = new Date();
    post.id = '';
    post.authorId = authorId;
    post.createdAt = now;
    post.publishedAt = now;
    post.likesCount = 0;
    post.commentsCount = 0;
  }

  /**
   * Синхронизирует очередь рассылки notify со статусом поста после правки.
   * Опубликованный пост отправляется заново: так notify подхватит и возврат
   * из черновика, и новый заголовок. Повтор безопасен — notify делает upsert
   * и не сбрасывает отметку об уже выполненной рассылке.
   */
  private notifyStatusChange(post: Post, wasPublished: boolean): void {
    if (post.status === PostStatus.Published) {
      this.notifyClient.publishPostPublished(post);
    } else if (wasPublished) {
      this.notifyClient.publishPostUnpublished(post.id);
    }
  }

  private buildFromDto(dto: CreatePostDto): Post {
    switch (dto.type) {
      case PostType.Video: {
        const post = new VideoPost();
        post.title = dto.title;
        post.videoUrl = dto.videoUrl;
        return post;
      }
      case PostType.Text: {
        const post = new TextPost();
        post.title = dto.title;
        post.announce = dto.announce;
        post.text = dto.text;
        return post;
      }
      case PostType.Quote: {
        const post = new QuotePost();
        post.quoteText = dto.quoteText;
        post.quoteAuthor = dto.quoteAuthor;
        return post;
      }
      case PostType.Photo: {
        const post = new PhotoPost();
        post.photoUrl = dto.photoUrl;
        return post;
      }
      case PostType.Link: {
        const post = new LinkPost();
        post.link = dto.link;
        post.description = dto.description;
        return post;
      }
    }
  }

  private cloneByType(source: Post): Post {
    switch (source.type) {
      case PostType.Video:
        return Object.assign(new VideoPost(), source);
      case PostType.Text:
        return Object.assign(new TextPost(), source);
      case PostType.Quote:
        return Object.assign(new QuotePost(), source);
      case PostType.Photo:
        return Object.assign(new PhotoPost(), source);
      case PostType.Link:
        return Object.assign(new LinkPost(), source);
    }
  }
}
