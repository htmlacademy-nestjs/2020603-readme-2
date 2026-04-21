import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PostStatus } from '@project/shared-types';
import type { PostRepository, PostQuery } from './post.repository.interface.js';
import { PostEntity } from './post.entity.js';
import { DEFAULT_LIMIT } from './post.constant.js';

@Injectable()
export class PostMemoryRepository implements PostRepository {
  private readonly storage = new Map<string, PostEntity>();

  public async findById(id: string): Promise<PostEntity | null> {
    return this.storage.get(id) ?? null;
  }

  public async findAll(query: PostQuery): Promise<PostEntity[]> {
    const {
      limit = DEFAULT_LIMIT,
      page = 1,
      sortBy = 'publishedAt',
      type,
      tag,
      authorId,
    } = query;

    let posts = [...this.storage.values()].filter(
      (p) => p.status === PostStatus.Published,
    );

    if (type) posts = posts.filter((p) => p.type === type);
    if (tag) posts = posts.filter((p) => p.tags.includes(tag));
    if (authorId) posts = posts.filter((p) => p.authorId === authorId);

    posts.sort((a, b) => {
      if (sortBy === 'likes') return b.likesCount - a.likesCount;
      if (sortBy === 'comments') return b.commentsCount - a.commentsCount;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

    const offset = (page - 1) * limit;
    return posts.slice(offset, offset + limit);
  }

  public async findDrafts(authorId: string): Promise<PostEntity[]> {
    return [...this.storage.values()].filter(
      (p) => p.authorId === authorId && p.status === PostStatus.Draft,
    );
  }

  public async findByTitle(title: string): Promise<PostEntity[]> {
    const titleLower = title.toLowerCase();
    return [...this.storage.values()]
      .filter(
        (p) =>
          p.status === PostStatus.Published &&
          p.title?.toLowerCase().includes(titleLower),
      )
      .slice(0, 20);
  }

  public async findRepost(originalPostId: string, authorId: string): Promise<PostEntity | null> {
    return (
      [...this.storage.values()].find(
        (p) => p.isRepost && p.originalPostId === originalPostId && p.authorId === authorId,
      ) ?? null
    );
  }

  public async save(entity: PostEntity): Promise<PostEntity> {
    entity.id = randomUUID();
    entity.createdAt = new Date();
    entity.publishedAt = new Date();
    this.storage.set(entity.id, entity);
    return entity;
  }

  public async update(entity: PostEntity): Promise<PostEntity> {
    this.storage.set(entity.id, entity);
    return entity;
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
