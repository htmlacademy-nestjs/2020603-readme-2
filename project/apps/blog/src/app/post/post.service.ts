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
import { PostRepository } from './post.repository';
import type { GetPostQueryDto } from './dto/get-post-query.dto';
import type { CreateVideoPostDto } from './dto/create-video-post.dto';
import type { CreateTextPostDto } from './dto/create-text-post.dto';
import type { CreateQuotePostDto } from './dto/create-quote-post.dto';
import type { CreatePhotoPostDto } from './dto/create-photo-post.dto';
import type { CreateLinkPostDto } from './dto/create-link-post.dto';
import {
  PostNotFoundError,
  PostEditForbiddenError,
  PostAlreadyRepostedError,
} from './post.errors';

type CreatePostDto =
  | CreateVideoPostDto
  | CreateTextPostDto
  | CreateQuotePostDto
  | CreatePhotoPostDto
  | CreateLinkPostDto;

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  public async createPost(dto: CreatePostDto, authorId: string): Promise<Post> {
    const now = new Date();
    const tags = this.normalizeTags(dto.tags ?? []);

    const post = this.buildPostByDto(dto);
    post.id = '';
    post.status = PostStatus.Published;
    post.authorId = authorId;
    post.isRepost = false;
    post.tags = tags;
    post.createdAt = now;
    post.publishedAt = now;
    post.likesCount = 0;
    post.commentsCount = 0;

    return this.postRepository.save(post);
  }

  public async findPost(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new PostNotFoundError(id);
    return post;
  }

  public async findAll(
    query: GetPostQueryDto,
  ): Promise<PaginationResult<Post>> {
    return this.postRepository.findAll(query);
  }

  public async findFeed(
    userId: string,
    query: GetPostQueryDto,
  ): Promise<PaginationResult<Post>> {
    return this.postRepository.findFeed(userId, query);
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

  public async updatePost(
    id: string,
    dto: Partial<CreatePostDto>,
    authorId: string,
  ): Promise<Post> {
    const post = await this.findPost(id);
    if (post.authorId !== authorId) throw new PostEditForbiddenError();

    Object.assign(post, dto, {
      tags: dto.tags ? this.normalizeTags(dto.tags) : post.tags,
    });

    return this.postRepository.update(post);
  }

  public async deletePost(id: string, authorId: string): Promise<void> {
    const post = await this.findPost(id);
    if (post.authorId !== authorId) throw new PostEditForbiddenError();
    await this.postRepository.deleteById(id);
  }

  public async repost(postId: string, authorId: string): Promise<Post> {
    const original = await this.findPost(postId);

    const existingRepost = await this.postRepository.findRepost(postId, authorId);
    if (existingRepost) {
      throw new PostAlreadyRepostedError(postId);
    }

    const now = new Date();

    const reposted = this.cloneByType(original);
    reposted.id = '';
    reposted.authorId = authorId;
    reposted.originalAuthorId = original.authorId;
    reposted.originalPostId = original.id;
    reposted.isRepost = true;
    reposted.publishedAt = now;
    reposted.createdAt = now;
    reposted.likesCount = 0;
    reposted.commentsCount = 0;

    return this.postRepository.save(reposted);
  }

  private normalizeTags(tags: string[]): string[] {
    return [...new Set(tags.map((tag) => tag.toLowerCase()))];
  }

  private buildPostByDto(dto: CreatePostDto): Post {
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
