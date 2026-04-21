import { Injectable } from '@nestjs/common';
import { PostStatus, PostType } from '@project/shared-types';
import { PostMemoryRepository } from './post-memory.repository';
import { PostEntity } from './post.entity';
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
  constructor(private readonly postRepository: PostMemoryRepository) {}

  public async createPost(dto: CreatePostDto, authorId: string): Promise<PostEntity> {
    const now = new Date();
    const tags = this.normalizeTags(dto.tags ?? []);

    const base = {
      id: '',
      status: PostStatus.Published,
      authorId,
      isRepost: false,
      tags,
      createdAt: now,
      publishedAt: now,
      likesCount: 0,
      commentsCount: 0,
    };

    let post: PostEntity;

    switch (dto.type) {
      case PostType.Video:
        post = new PostEntity({ ...base, type: PostType.Video, title: dto.title, videoUrl: dto.videoUrl });
        break;
      case PostType.Text:
        post = new PostEntity({ ...base, type: PostType.Text, title: dto.title, announce: dto.announce, text: dto.text });
        break;
      case PostType.Quote:
        post = new PostEntity({ ...base, type: PostType.Quote, quoteText: dto.quoteText, quoteAuthor: dto.quoteAuthor });
        break;
      case PostType.Photo:
        post = new PostEntity({ ...base, type: PostType.Photo, photoUrl: dto.photoUrl });
        break;
      case PostType.Link:
        post = new PostEntity({ ...base, type: PostType.Link, link: dto.link, description: dto.description });
        break;
    }

    return this.postRepository.save(post);
  }

  public async findPost(id: string): Promise<PostEntity> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new PostNotFoundError(id);
    return post;
  }

  public async findAll(query: GetPostQueryDto): Promise<PostEntity[]> {
    return this.postRepository.findAll(query);
  }

  public async findDrafts(authorId: string): Promise<PostEntity[]> {
    return this.postRepository.findDrafts(authorId);
  }

  public async search(title: string): Promise<PostEntity[]> {
    return this.postRepository.findByTitle(title);
  }

  public async updatePost(
    id: string,
    dto: Partial<CreatePostDto>,
    authorId: string,
  ): Promise<PostEntity> {
    const post = await this.findPost(id);
    if (post.authorId !== authorId) throw new PostEditForbiddenError();

    Object.assign(post, {
      ...dto,
      tags: dto.tags ? this.normalizeTags(dto.tags) : post.tags,
    });

    return this.postRepository.update(post);
  }

  public async deletePost(id: string, authorId: string): Promise<void> {
    const post = await this.findPost(id);
    if (post.authorId !== authorId) throw new PostEditForbiddenError();
    await this.postRepository.deleteById(id);
  }

  public async repost(postId: string, authorId: string): Promise<PostEntity> {
    const original = await this.findPost(postId);

    const existingRepost = await this.postRepository.findRepost(postId, authorId);
    if (existingRepost) {
      throw new PostAlreadyRepostedError(postId);
    }

    const now = new Date();

    const repostedPost = new PostEntity({
      ...original.toObject(),
      id: '',
      authorId,
      originalAuthorId: original.authorId,
      originalPostId: original.id,
      isRepost: true,
      publishedAt: now,
      createdAt: now,
      likesCount: 0,
      commentsCount: 0,
    } as any);

    return this.postRepository.save(repostedPost);
  }

  private normalizeTags(tags: string[]): string[] {
    return [...new Set(tags.map((tag) => tag.toLowerCase()))];
  }
}
